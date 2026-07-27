package com.example.mypage.myInfo.repository;

import com.example.auth.domain.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MyInfoRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByLoginId(String loginId);
}
