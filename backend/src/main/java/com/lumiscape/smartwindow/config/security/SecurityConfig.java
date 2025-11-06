package com.lumiscape.smartwindow.config.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    
    // TODO: 앞으로 만들 OAuth2 관련 서비스들을 주입받을 예정입니다.
    // private final CustomOAuth2UserService customOAuth2UserService;
    // private final OAuth2SuccessHandler oAuth2SuccessHandler;
    // private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 1. 기본 인증 방식 비활성화
                .csrf(csrf -> csrf.disable()) // CSRF 보호 비활성화
                .httpBasic(basic -> basic.disable()) // HTTP Basic 인증 비활성화
                .formLogin(form -> form.disable()) // 폼 로그인 비활성화

                // 2. 세션 관리 방식을 STATELESS(세션 사용 안함)으로 설정 -> JWT 인증을 위함
                .sessionManagement(configurer -> configurer.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                
                // 3. CORS 설정 추가
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 4. 요청 경로별 접근 권한 설정
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/", "/login/**", "/oauth2/**", "/swagger-ui/**", "/v3/api-docs/**").permitAll() // 이 주소들은 모두 허용
                        .anyRequest().authenticated() // 나머지 모든 요청은 인증 필요
                )

                // 5. OAuth2 로그인 설정
                .oauth2Login(oauth2 -> {
                        // TODO: 로그인 성공/실패 핸들러, 사용자 정보 서비스 연결
                        // .userInfoEndpoint(user -> user.userService(customOAuth2UserService))
                        // .successHandler(oAuth2SuccessHandler)
                })
                
                // 6. JWT 필터 추가
                // TODO: 우리가 만든 JWT 필터를 Spring Security 필터 체인에 추가
                // .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        ; // <-- 여기에 http 설정 체인을 마무리하는 세미콜론 추가

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // TODO: 프론트엔드 개발 서버 주소 추가 필요
        configuration.setAllowedOriginPatterns(List.of("http://localhost:*", "http://127.0.0.1:*"));
        configuration.setAllowedMethods(Arrays.asList("GET","POST","PUT","DELETE","PATCH","OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true); // 자격 증명 허용

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // 모든 경로에 대해 위 설정 적용
        return source;
    }
}
