package com.lumiscape.smartwindow.user.domain.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "user_social_accounts")
public class UserSocialAccount {

    @EmbeddedId
    private UserSocialAccountId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;


    @Builder
    public UserSocialAccount(UserSocialAccountId id, User user) {
        this.id = id;
        this.user = user;
    }
}