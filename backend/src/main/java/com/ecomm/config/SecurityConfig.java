package com.ecomm.config;

import com.ecomm.model.User;
import com.ecomm.model.UserPrincipal;
import com.ecomm.service.CustomOAuth2UserService;
import com.ecomm.service.JwtService;
import jakarta.servlet.http.Cookie;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtFilter jwtFilter;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private CustomOAuth2UserService customOAuth2UserService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());   //Using BCrypt
        return provider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        return httpSecurity
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/register", "/login", "/forgot-password", "/reset-password").permitAll()
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/swagger-resources/**",
                                "/swagger-ui.html",
                                "/webjars/**"
                        ).permitAll()

                        // Product endpoints
                        .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/product/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products/search").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/products/*/decrement-stock").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/products").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")

                        // Razorpay endpoints
                        .requestMatchers(HttpMethod.POST, "/api/payment/create-order").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/payment/verify").authenticated()

                        // Order endpoints
                        .requestMatchers(HttpMethod.GET, "/api/orders/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/orders/**").authenticated()

                        // Profile endpoint
                        .requestMatchers("/profile").authenticated()

                        // Preflight and error support
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        //Gemini emdpoint
                        .requestMatchers(HttpMethod.POST, "/api/gemini/**").permitAll()
                        // Any other request
                        .anyRequest().authenticated()
                )
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .oauth2Login(oauth2 -> oauth2
                        .loginPage("/login")
                        .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                        .successHandler((request, response, authentication) -> {
                            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
                            String email = oAuth2User.getAttribute("email");
                            UserPrincipal userPrincipal = (UserPrincipal) userDetailsService.loadUserByUsername(email);
                            User user = userPrincipal.getUser();

                            String jwt = jwtService.generateToken(user);

//                            String jwt = (String) oAuth2User.getAttributes().get("token");

                            Cookie cookie = new Cookie("token", jwt);
                            cookie.setHttpOnly(true);
                           cookie.setSecure(true);
                            cookie.setPath("/");
                            cookie.setMaxAge(7 * 24 * 60 * 60);         //  7 days
                            cookie.setDomain("ecomm-eight-bice.vercel.app");
                            cookie.setAttribute("SameSite", "None"); // Required if using cross-origin cookies
                            response.addCookie(cookie);
                            response.sendRedirect("https://ecomm-eight-bice.vercel.app/oauth2/redirect"); // Redirect to home or dashboard
//                            response.sendRedirect("http://localhost:5173/oauth2/redirect?token=" + jwt);

                        })

                        .failureHandler((request, response, exception) -> {
                            // Handle OAuth2 failures (e.g., redirect to error page)
                            response.sendRedirect("https://ecomm-eight-bice.vercel.app/error");
//                            response.sendRedirect("http://localhost:5173/error");
                        })
                )
                .build();
    }



    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
                "https://ecomm-eight-bice.vercel.app",
                "http://localhost:5173"             //dev use
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setExposedHeaders(List.of("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }


    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}

//        @Bean
//        public UserDetailsService userDetailsService() {
//            UserDetails adminUser = User
//                    .withDefaultPasswordEncoder()
//                    .username("admin")
//                    .password("password").
//                    roles("ADMIN").
//                    build();
//
//
//            UserDetails user = User
//                    .withDefaultPasswordEncoder()
//                    .username("omkar")
//                    .password("password")
//                    .roles("USER")
//                    .build();
//            return new InMemoryUserDetailsManager(user, adminUser);
//
//        }
