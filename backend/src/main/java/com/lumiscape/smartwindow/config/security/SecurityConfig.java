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

    private final OAuth2SuccessHandler oAuth2SuccessHandler; // 1. 이 필드를 다시 추가
    
    // TODO: 앞으로 만들 OAuth2 관련 서비스들을 주입받을 예정입니다.
    // private final CustomOAuth2UserService customOAuth2UserService;
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
                        // 2. "/auth/success" 경로를 permitAll에 추가
                        .requestMatchers("/", "/login/**", "/oauth2/**", "/swagger-ui/**", "/v3/api-docs/**", "/auth/success").permitAll() 
                        .anyRequest().authenticated()
                )

                // 5. OAuth2 로그인 설정
                .oauth2Login(oauth2 -> oauth2
                        .successHandler(oAuth2SuccessHandler) // 3. successHandler를 등록
                )
                
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
