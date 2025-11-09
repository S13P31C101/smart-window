package com.lumiscape.smartwindow.user.dto;

import com.lumiscape.smartwindow.user.domain.entity.User;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UserInfoResponseDto {
    
    private Long id;
    private String email;
    private String nickname;

    public UserInfoResponseDto(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.nickname = user.getNickname();
    }
}