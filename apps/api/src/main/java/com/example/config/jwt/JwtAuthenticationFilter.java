package com.example.config.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
) throws ServletException, IOException {

    String token = resolveToken(request);

    System.out.println("========== JWT FILTER ==========");
    System.out.println("TOKEN : " + token);
    System.out.println("VALID : " + jwtTokenProvider.validateToken(token));


    if (StringUtils.hasText(token) && jwtTokenProvider.validateToken(token)) {

        System.out.println(
        "LOGIN ID : " + jwtTokenProvider.getLoginId(token)
);
        Authentication auth = jwtTokenProvider.getAuthentication(token);

        System.out.println("AUTH USER : " + auth.getName());

        SecurityContextHolder.getContext().setAuthentication(auth);

    } else {

        System.out.println("JWT INVALID");

    }


    filterChain.doFilter(request, response);
}

    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
