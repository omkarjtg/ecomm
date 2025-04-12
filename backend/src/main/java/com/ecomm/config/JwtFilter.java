package com.ecomm.config;

import com.ecomm.service.JwtService;
import com.ecomm.model.UserPrincipal;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import io.jsonwebtoken.JwtException;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtFilter.class);
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String token = extractToken(request);

        if (token == null) {
            logger.debug("No valid JWT found in Authorization header or token cookie.");
            chain.doFilter(request, response);
            return;
        }

        try {
            String email = jwtService.extractEmail(token);
            if (email == null) {
                logger.warn("No email found in JWT.");
                chain.doFilter(request, response);
                return;
            }

            if (SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                if (!(userDetails instanceof UserPrincipal userPrincipal)) {
                    logger.error("UserDetails is not an instance of UserPrincipal.");
                    chain.doFilter(request, response);
                    return;
                }

                if (jwtService.validateToken(token, userPrincipal.getUser())) {
                    List<SimpleGrantedAuthority> authorities = jwtService.extractRoles(token).stream()
                            .map(SimpleGrantedAuthority::new)
                            .toList();

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(userPrincipal, null, authorities);
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    logger.debug("Authentication set for user: {}", email);
                } else {
                    logger.warn("Invalid or expired JWT for user: {}", email);
                }
            }
        } catch (JwtException e) {
            logger.error("JWT processing error: {}", e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error in JWT filter: {}", e.getMessage());
        }

        chain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        // Check Authorization header first
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            logger.debug("JWT found in Auth header");
            return authHeader.substring(7);
        }

        // Fallback to cookie
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("token".equals(cookie.getName())) {
                    logger.debug("JWT found in token cookie.");
                    return cookie.getValue();
                }
            }
        }

        return null;
    }
}