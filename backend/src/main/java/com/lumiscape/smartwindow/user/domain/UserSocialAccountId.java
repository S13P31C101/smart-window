package com.lumiscape.smartwindow.user.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Embeddable
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class UserSocialAccountId implements Serializable {

    @Column(name = "social_id", length = 255)
    private String socialId;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider", columnDefinition = "social_provider_enum")
    private SocialProvider provider;
}
