package com.ecomm.config;

import com.ecomm.service.JwtService;
import com.ecomm.model.UserPrincipal;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        System.out.println("Incoming Auth Header: " + authHeader);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("Authorization header is missing or does not start with Bearer.");
            chain.doFilter(request, response);
            return;
        }

        final String token = authHeader.substring(7);
        System.out.println("Extracted Token: " + token);

        try {
            final String email = jwtService.extractEmail(token);
            System.out.println("Extracted Email: " + email);

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                boolean isTokenValid = jwtService.validateToken(token, ((UserPrincipal) userDetails).getUser());
                System.out.println("Is Token Valid: " + isTokenValid);

                if (isTokenValid) {
                    System.out.println("Extracted roles: " + jwtService.extractRoles(token));

                    List<SimpleGrantedAuthority> authorities = jwtService.extractRoles(token).stream()
                            .map(SimpleGrantedAuthority::new)
                            .toList();

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    System.out.println("Authentication Token Created: " + authToken);
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    System.out.println("Authentication set in SecurityContextHolder.");
                } else {
                    System.out.println("Token validation failed.");
                }
            }
        } catch (Exception e) {
            System.err.println("Error processing JWT: " + e.getMessage());
        }

        chain.doFilter(request, response);
    }
}