package com.lumiscape.smartwindow.config.ai;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class AITokenAuthFilter extends OncePerRequestFilter {

    private static final String AI_TOKEN_HEADER = "X-AI-Token";
    private static final String AI_SERVER_ROLE = "ROLE_AI_SERVER";
    private static final String AI_SERVER_PRINCIPAL_NAME = "ai-server";

    private final String secret;

    public AITokenAuthFilter(@Value("${app.ai.secret}") String secret) {
        this.secret = secret;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String token = request.getHeader(AI_TOKEN_HEADER);

        if (StringUtils.hasText(token) && secret.equals(token)) {
            Authentication authentication = new UsernamePasswordAuthenticationToken(AI_SERVER_PRINCIPAL_NAME,
                    null,
                    Collections.singleton(new SimpleGrantedAuthority(AI_SERVER_ROLE)));

            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }
}