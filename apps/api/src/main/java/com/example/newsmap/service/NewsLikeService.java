package com.example.newsmap.service;

import com.example.auth.domain.User;
import com.example.auth.repository.UserRepository;
import com.example.newsmap.domain.NewsLike;
import com.example.newsmap.repository.NewsLikeRepository;
import com.example.newsmap.response.LikeToggleResponse;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NewsLikeService {

    private final NewsLikeRepository newsLikeRepository;
    private final UserRepository userRepository;

    @Transactional
    public LikeToggleResponse toggleLike(String newsId, String loginId) {
        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        Optional<NewsLike> existing = newsLikeRepository.findByNewsIdAndUser_Id(newsId, user.getId());
        boolean liked;
        if (existing.isPresent()) {
            newsLikeRepository.delete(existing.get());
            liked = false;
        } else {
            newsLikeRepository.save(NewsLike.builder().newsId(newsId).user(user).build());
            liked = true;
        }
        return new LikeToggleResponse(liked, newsLikeRepository.countByNewsId(newsId));
    }
}
