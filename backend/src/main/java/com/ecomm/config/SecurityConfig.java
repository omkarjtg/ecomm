        package com.ecomm.config;

        import org.springframework.beans.factory.annotation.Autowired;
        import org.springframework.context.annotation.Bean;
        import org.springframework.context.annotation.Configuration;
        import org.springframework.http.HttpMethod;
        import org.springframework.security.authentication.AuthenticationManager;
        import org.springframework.security.authentication.AuthenticationProvider;
        import   org.springframework.security.authentication.dao.DaoAuthenticationProvider;
        import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
        import org.springframework.security.config.annotation.web.builders.HttpSecurity;
        import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
        import org.springframework.security.config.http.SessionCreationPolicy;
        import org.springframework.security.core.userdetails.UserDetailsService;
        import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
        import org.springframework.security.crypto.password.PasswordEncoder;
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
                                .requestMatchers(HttpMethod.PUT, "/api/product/*/decrement-stock").authenticated()
                                .requestMatchers(HttpMethod.PUT, "/api/product/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.POST, "/api/product").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.DELETE, "/api/product").hasRole("ADMIN")

                                // Razorpay endpoints
                                .requestMatchers(HttpMethod.POST, "/api/payment/create-order").authenticated()
                                .requestMatchers(HttpMethod.POST, "/api/payment/verify").authenticated()

                                //Order endpoints
                                .requestMatchers(HttpMethod.GET, "/api/orders/**").authenticated()
                                .requestMatchers(HttpMethod.POST, "/api/orders/**").authenticated()
                                // Profile endpoint
                                .requestMatchers("/profile").authenticated()

                                //preflight OPTIONS support
                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                                .requestMatchers("/error").permitAll()

                                // Any other request
                                .anyRequest().authenticated()
                        )
                        .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                        .authenticationProvider(authenticationProvider())
                        .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                        .build();
            }



            @Bean
            public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration config = new CorsConfiguration();
                config.setAllowedOrigins(List.of("http://localhost:5173"));
                config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                config.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));
                config.setExposedHeaders(List.of("Authorization"));
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
