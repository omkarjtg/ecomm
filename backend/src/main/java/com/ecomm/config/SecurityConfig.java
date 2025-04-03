    package com.ecomm.config;

    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.context.annotation.Bean;
    import org.springframework.context.annotation.Configuration;
    import org.springframework.security.authentication.AuthenticationManager;
    import org.springframework.security.authentication.AuthenticationProvider;
    import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
    import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
    import org.springframework.security.config.annotation.web.builders.HttpSecurity;
    import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
    import org.springframework.security.config.http.SessionCreationPolicy;
    import org.springframework.security.core.userdetails.UserDetailsService;
    import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
    import org.springframework.security.crypto.password.PasswordEncoder;
    import org.springframework.security.web.SecurityFilterChain;
    import org.springframework.web.cors.CorsConfiguration;
    import org.springframework.web.cors.CorsConfigurationSource;
    import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

    import java.util.List;

    @Configuration
    @EnableWebSecurity
    public class SecurityConfig {

        @Autowired
        private UserDetailsService userDetailsService;

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
            httpSecurity
                    .csrf(csrf -> csrf.disable())
                    .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                    .authorizeHttpRequests(auth -> auth
                            .requestMatchers("/register", "/login").permitAll()  // Public Endpoints
                            .requestMatchers("/api/products/**").permitAll()  // Allow everyone to view products
                            .requestMatchers("/api/product/{id}").permitAll()  // Anyone can view product details
                            .requestMatchers("/api/product/{productId}/image").permitAll() // Images are public
                            .requestMatchers("/api/products/search").permitAll()  // Searching products is public
                            .requestMatchers("/api/product").hasRole("ADMIN")  // Only admins can add products
                            .requestMatchers("/api/product/*").hasRole("ADMIN")  // Only admins can update or delete
                            .anyRequest().authenticated()  // catch all/Everything else needs authentication
                    )
//                    .httpBasic(Customizer.withDefaults())
                    .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
            return httpSecurity.build();
        }


        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
            CorsConfiguration config = new CorsConfiguration();
            config.setAllowedOrigins(List.of("http://localhost:5173"));
            config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
            config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
            config.setAllowCredentials(true);

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

