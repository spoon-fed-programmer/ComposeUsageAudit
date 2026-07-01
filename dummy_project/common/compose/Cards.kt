package com.common.compose.card

import androidx.compose.runtime.Composable
import androidx.compose.desktop.ui.tooling.preview.Preview

/**
 * Card component for displaying product details.
 *
 * ![ProductCard Preview](images/ProductCard.png)
 *
 * Typically includes an image, title, price, and CTA to add the product to a cart.
 */
@Composable
fun ProductCard() {
    // Product display card
}

/**
 * User profile summary card.
 *
 * ![UserCard Preview](images/UserCard.png)
 *
 * Displays user avatar, name, bio, and quick actions (e.g., follow, message).
 */
@Composable
fun UserCard() {
    // User profile summary card
}

/**
 * Card for showing transient notification items.
 *
 * Displays the notification content, source app/user, time elapsed, and dismiss options.
 */
@Composable
fun NotificationCard() {
    // Notification item card
}

/**
 * Settings configuration card.
 *
 * Groups toggle switches, slider controls, or simple settings option details together.
 */
@Composable
fun SettingsCard() {
    // Settings configuration card
}

/**
 * Visual card focused heavily on rendering image content.
 *
 * Overlays text/titles directly on top of the image container with standard gradients.
 */
@Composable
fun ImageCard() {
    // Card focusing on image content
}

/**
 * General purpose card.
 *
 * A baseline container with configurable elevation, borders, and padding.
 */
@Composable
fun StandardCard() {
    // General purpose card
}

@Preview
@Composable
fun ProductCardPreview() {
    ProductCard()
}

@Preview
@Composable
fun UserCardPreview() {
    UserCard()
}


