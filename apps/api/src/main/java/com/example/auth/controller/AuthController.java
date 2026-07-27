package com.example.auth.controller;

import com.example.auth.domain.User;
import com.example.auth.repository.UserRepository;
import com.example.config.jwt.JwtTokenProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@Tag(name = "인증 API", description = "회원가입 및 로그인 등 인증 관련 API")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Operation(summary = "회원가입", description = "새로운 유저 정보(아이디, 비밀번호, 이름, 이메일, 전화번호)를 등록합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "회원가입 성공", content = @Content(schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "400", description = "이미 존재하는 아이디 또는 이메일", content = @Content(schema = @Schema(implementation = String.class)))
    })
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

    @Operation(summary = "로그인", description = "로그인 아이디와 비밀번호 검증 후 JWT Access Token을 발급합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "로그인 성공 및 JWT 토큰 발급", content = @Content(schema = @Schema(implementation = TokenResponse.class))),
            @ApiResponse(responseCode = "400", description = "존재하지 않는 아이디 또는 비밀번호 불일치", content = @Content(schema = @Schema(implementation = String.class)))
    })
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

    @Schema(description = "회원가입 요청 DTO")
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SignUpRequest {
        @Schema(description = "로그인 아이디", example = "hong123")
        private String loginId;

        @Schema(description = "비밀번호", example = "password123!")
        private String password;

        @Schema(description = "사용자 이름", example = "홍길동")
        private String username;

        @Schema(description = "이메일 주소", example = "hong@example.com")
        private String email;

        @Schema(description = "전화번호", example = "010-1234-5678")
        private String phone;
    }

    @Schema(description = "로그인 요청 DTO")
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        @Schema(description = "로그인 아이디", example = "hong123")
        private String loginId;

        @Schema(description = "비밀번호", example = "password123!")
        private String password;
    }

    @Schema(description = "로그인 성공 응답 DTO")
    @Getter
    @Builder
    @AllArgsConstructor
    public static class TokenResponse {
        @Schema(description = "JWT Access Token", example = "eyJhbGciOiJIUzI1NiJ9...")
        private String token;

        @Schema(description = "로그인 아이디", example = "hong123")
        private String loginId;

        @Schema(description = "사용자 이름", example = "홍길동")
        private String username;

        @Schema(description = "이메일 주소", example = "hong@example.com")
        private String email;
    }
}
