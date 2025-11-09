package com.lumiscape.smartwindow.config.security;

import com.lumiscape.smartwindow.config.jwt.JwtTokenProvider;
import com.lumiscape.smartwindow.user.domain.entity.*;
import com.lumiscape.smartwindow.user.domain.repository.UserRepository;
import com.lumiscape.smartwindow.user.domain.repository.UserSocialAccountRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Collections;
import java.util.Map;
// import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final UserSocialAccountRepository userSocialAccountRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        // ↓↓↓ 여기서부터 try 블록 시작 ↓↓↓
        try {
            OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
            OAuth2User oauth2User = oauthToken.getPrincipal();
            Map<String, Object> attributes = oauth2User.getAttributes();
            
            log.info("소셜 로그인 성공! Provider로부터 받은 attributes: {}", attributes);

            String providerStr = oauthToken.getAuthorizedClientRegistrationId().toUpperCase();
            SocialProvider provider = SocialProvider.valueOf(providerStr);
            String socialId = oauth2User.getName();
            
            String email = extractEmail(providerStr, attributes);

            if (email == null) {
                log.error("소셜 로그인 실패: 이메일 정보를 받아올 수 없습니다. provider={}, attributes={}", providerStr, attributes);
                getRedirectStrategy().sendRedirect(request, response, "/login?error=email_not_found");
                return;
            }

            User user = userRepository.findByEmail(email).orElseGet(() -> {
                log.info("최초 소셜 로그인입니다. 자동 회원가입을 진행합니다. Email: {}", email);
                String nickname = extractNickname(providerStr, attributes);
                User newUser = User.builder()
                        .email(email)
                        .nickname(nickname)
                        .status(UserStatus.ACTIVE)
                        .build();
                return userRepository.save(newUser);
            });

            userSocialAccountRepository.findById(new UserSocialAccountId(socialId, provider))
                    .orElseGet(() -> {
                        log.info("기존 User(id:{})에 새로운 소셜 계정(provider:{})을 연결합니다.", user.getId(), provider);
                        UserSocialAccount newSocialAccount = UserSocialAccount.builder()
                            .user(user)
                            .id(new UserSocialAccountId(socialId, provider))
                            .build();
                        return userSocialAccountRepository.save(newSocialAccount);
                    });
            
            Long userId = user.getId();
            Authentication newAuth = new UsernamePasswordAuthenticationToken(userId, null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));
            String token = jwtTokenProvider.generateToken(newAuth);
            
            log.info("로그인 성공: User ID '{}'에 대한 JWT 발급", userId);

            String targetUrl = UriComponentsBuilder.fromUriString("/auth/success").queryParam("token", token).build().toUriString();
            getRedirectStrategy().sendRedirect(request, response, targetUrl);

        } catch (Exception e) {
            // ↓↓↓ 에러를 잡아서 로그를 남기는 부분 ↓↓↓
            log.error("!!! OAuth2SuccessHandler 처리 중 심각한 예외가 발생했습니다 !!!", e);
            // 에러 발생 시, 원인을 명시하여 에러 페이지로 보냅니다.
            getRedirectStrategy().sendRedirect(request, response, "/login?error=handler_exception");
        }
    }
    
    // 이메일 추출 로직 (타입 체크 추가)
    private String extractEmail(String provider, Map<String, Object> attributes) {
        if ("KAKAO".equals(provider)) {
            Object kakaoAccountObj = attributes.get("kakao_account");
            if (kakaoAccountObj instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> kakaoAccount = (Map<String, Object>) kakaoAccountObj;
                return (String) kakaoAccount.get("email");
            }
        } else if ("GOOGLE".equals(provider)) {
            return (String) attributes.get("email");
        } else if ("NAVER".equals(provider)) {
            Object responseObj = attributes.get("response");
            if (responseObj instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> responseMap = (Map<String, Object>) responseObj;
                return (String) responseMap.get("email");
            }
        }
        return null;
    }
    
    // 닉네임 추출 로직 (타입 체크 추가)
    private String extractNickname(String provider, Map<String, Object> attributes) {
        String nickname = null;
        if ("KAKAO".equals(provider)) {
            Object propertiesObj = attributes.get("properties");
            if (propertiesObj instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> properties = (Map<String, Object>) propertiesObj;
                nickname = (String) properties.get("nickname");
            }
        } else if ("GOOGLE".equals(provider)) {
            nickname = (String) attributes.get("name");
        } else if ("NAVER".equals(provider)) {
            Object responseObj = attributes.get("response");
            if (responseObj instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> responseMap = (Map<String, Object>) responseObj;
                nickname = (String) responseMap.get("nickname");
            }
        }
        
        return nickname != null ? nickname : "User" + System.currentTimeMillis();
    }
}