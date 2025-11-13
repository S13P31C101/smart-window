package com.lumiscape.smartwindow.user.service;

import com.lumiscape.smartwindow.global.exception.CustomException;
import com.lumiscape.smartwindow.global.exception.ErrorCode;
import com.lumiscape.smartwindow.user.domain.entity.User;
import com.lumiscape.smartwindow.user.domain.repository.UserRepository;
import com.lumiscape.smartwindow.user.dto.UserInfoResponseDto;
import com.lumiscape.smartwindow.user.dto.UserUpdateRequestDto;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    // 내 정보 조회 (User.id 기준)
    public UserInfoResponseDto getUserInfo(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        return new UserInfoResponseDto(user);
    }

    // 내 정보 수정 (User.id 기준)
    @Transactional
    public void updateNickname(Long userId, UserUpdateRequestDto requestDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        
        user.updateNickname(requestDto.getNickname());
    }

    // ↓↓↓ 여기에 최종 버전의 회원 탈퇴 로직을 추가합니다. ↓↓↓
    @Transactional
    public void deleteUser(Long userId) {
        // 1. ID로 User 엔티티를 찾습니다.
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // 2. User 엔티티와 연관된 socialAccounts 리스트를 비웁니다.
        // User 엔티티의 @OneToMany(orphanRemoval = true) 설정 덕분에,
        // 이 리스트에서 제거된 UserSocialAccount는 DB에서도 자동으로 삭제됩니다.
        user.getSocialAccounts().clear();
        
        // 3. User의 상태를 '탈퇴'로 변경합니다 (Soft Delete).
        user.withdraw();
    }
}


