package com.ecomm.service;

import com.ecomm.model.User;
import com.ecomm.model.UserPrincipal;
import com.ecomm.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class MyUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepo userRepo;

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        User user = userRepo.findByUsername(identifier);

        if (user == null) {
            user = userRepo.findByEmail(identifier); // Try searching by email
        }

        if (user == null) {
            throw new UsernameNotFoundException("User not found with username or email: " + identifier);
        }

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(), // Spring Security requires a unique identifier, use email
                user.getPassword(),
                new ArrayList<>()
        );
    }
}
