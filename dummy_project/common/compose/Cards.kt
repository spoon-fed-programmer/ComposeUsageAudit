package com.common.compose.card

import androidx.compose.runtime.Composable
import androidx.compose.desktop.ui.tooling.preview.Preview
import androidx.compose.material.Card
import androidx.compose.material.Text
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.text.font.FontWeight

/**
 * Card component for displaying product details.
 *
 * ![ProductCard Preview](images/ProductCard.png)
 *
 * Typically includes an image, title, price, and CTA to add the product to a cart.
 */
@Composable
fun ProductCard() {
    Card(modifier = Modifier.padding(8.dp)) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("Premium Headphones", fontWeight = FontWeight.Bold)
            Text("$299.00", color = androidx.compose.ui.graphics.Color.Gray)
        }
    }
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
    Card(modifier = Modifier.padding(8.dp)) {
        Row(modifier = Modifier.padding(16.dp)) {
            Column {
                Text("Jane Doe", fontWeight = FontWeight.Bold)
                Text("Software Engineer", color = androidx.compose.ui.graphics.Color.Gray)
            }
        }
    }
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

/** @suppress */
@Preview
@Composable
fun ProductCardPreview() {
    ProductCard()
}

/** @suppress */
@Preview
@Composable
fun UserCardPreview() {
    UserCard()
}




