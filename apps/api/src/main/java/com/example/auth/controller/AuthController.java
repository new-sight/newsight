package com.example.auth.controller;

import com.example.auth.domain.User;
import com.example.auth.repository.UserRepository;
import com.example.config.jwt.JwtTokenProvider;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/signup")
    public ResponseEntity<String> signUp(@RequestBody SignUpRequest dto) {
        if (userRepository.existsByLoginId(dto.getLoginId())) {
            return ResponseEntity.badRequest().body("이미 존재하는 아이디입니다.");
        }
        if (userRepository.existsByEmail(dto.getEmail())) {
            return ResponseEntity.badRequest().body("이미 존재하는 이메일입니다.");
        }

        User user = User.builder()
                .loginId(dto.getLoginId())
                .password(passwordEncoder.encode(dto.getPassword()))
                .username(dto.getUsername() != null ? dto.getUsername() : dto.getLoginId())
                .email(dto.getEmail())
                .phone(dto.getPhone() != null ? dto.getPhone() : "")
                .role(User.Role.ROLE_USER)
                .build();

        userRepository.save(user);
        return ResponseEntity.ok("회원가입이 완료되었습니다.");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest dto) {
        User user = userRepository.findByLoginId(dto.getLoginId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 아이디입니다."));

        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body("비밀번호가 일치하지 않습니다.");
        }

        String token = jwtTokenProvider.createToken(user.getLoginId(), user.getRole().name());
        return ResponseEntity.ok(TokenResponse.builder()
                .token(token)
                .loginId(user.getLoginId())
                .username(user.getUsername())
                .email(user.getEmail())
                .build());
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SignUpRequest {
        private String loginId;  // 로그인 아이디 (e.g. hong123)
        private String password; // 비밀번호
        private String username; // 사용자 이름 (e.g. 홍길동)
        private String email;    // 이메일
        private String phone;    // 전화번호
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        private String loginId;  // 로그인 아이디
        private String password; // 비밀번호
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class TokenResponse {
        private String token;
        private String loginId;
        private String username;
        private String email;
    }
}
