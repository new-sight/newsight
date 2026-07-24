package com.example.auth.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "login_id", unique = true, nullable = false, length = 50)
  private String loginId; // 로그인 아이디 (e.g. hong123)

  @Column(nullable = false, length = 255)
  private String password; // 비밀번호 (BCrypt 암호화)

  @Column(nullable = false, length = 50)
  private String username; // 사용자 이름 (e.g. 홍길동)

  @Column(unique = true, nullable = false, length = 100)
  private String email; // 이메일

  @Column(length = 20)
  private String phone; // 전화번호

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private Role role;

  @CreationTimestamp
  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt; // 가입 일시

  public enum Role {
    ROLE_USER, ROLE_ADMIN;
  }
}
