package com.ecomm.controller;

import com.ecomm.dto.LoginRequest;
import com.ecomm.dto.ProfileDTO;
import com.ecomm.dto.RegisterRequest;
import com.ecomm.model.Role;
import com.ecomm.model.User;
import com.ecomm.service.JwtService;
import com.ecomm.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;


@RestController
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProfileDTO> getProfile(Authentication authentication) {
        String currentUsername = authentication.getName();
        User user = userService.findByUsernameOrEmail(currentUsername);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        ProfileDTO profile = new ProfileDTO(user);
        return ResponseEntity.ok(profile);
    }



    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest registerRequest) {
        System.out.println("Received register request for email: " + registerRequest.getEmail());

        if (registerRequest.getEmail() == null || registerRequest.getPassword() == null) {
            System.out.println("Email or password is null");
            return new ResponseEntity<>("Email and password are required", HttpStatus.BAD_REQUEST);
        }

        // Check if email already exists
        User existingUser = userService.findByEmail(registerRequest.getEmail());
        if (existingUser != null) {
            System.out.println("Email already in use: " + registerRequest.getEmail());
            return new ResponseEntity<>("Email already in use", HttpStatus.BAD_REQUEST);
        }

        // Map RegisterRequest to User
        User user = new User();
        user.setUsername(registerRequest.getName()); // Use name as username
        user.setEmail(registerRequest.getEmail());
        user.setPassword(registerRequest.getPassword());
        user.setRoles(Role.USER);

        // Save user with encoded password
        String plaintextPassword = user.getPassword();
        User savedUser = userService.saveUser(user);

        // Authenticate newly registered user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(savedUser.getEmail(), plaintextPassword));

        if (authentication.isAuthenticated()) {
            String token = jwtService.generateToken(savedUser);
            System.out.println("Registration successful for user: " + savedUser.getUsername());
            return new ResponseEntity<>(token, HttpStatus.CREATED);
        } else {
            System.out.println("Registration successful, but auto-login failed for user: " + savedUser.getUsername());
            return new ResponseEntity<>("Registration successful, but auto-login failed", HttpStatus.OK);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest loginRequest) {
        System.out.println("Received login request for identifier: " + loginRequest.getIdentifier());
        if (loginRequest.getIdentifier() == null || loginRequest.getIdentifier().trim().isEmpty()) {
            System.out.println("Identifier is null or empty");
            return new ResponseEntity<>("Username or email is required", HttpStatus.BAD_REQUEST);
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getIdentifier(), loginRequest.getPassword()));

        if (authentication.isAuthenticated()) {
            User user = userService.findByUsernameOrEmail(loginRequest.getIdentifier());
            if (user == null) {
                System.out.println("User not found: " + loginRequest.getIdentifier());
                return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
            }
            String token = jwtService.generateToken(user);
            System.out.println("Login successful for user: " + user.getUsername());
            return ResponseEntity.ok(token);
        } else {
            System.out.println("Authentication failed for identifier: " + loginRequest.getIdentifier());
            return new ResponseEntity<>("Login failed", HttpStatus.UNAUTHORIZED);
        }
    }
}