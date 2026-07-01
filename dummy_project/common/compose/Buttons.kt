package com.common.compose.button

import androidx.compose.runtime.Composable
import androidx.compose.desktop.ui.tooling.preview.Preview
import androidx.compose.material.Button
import androidx.compose.material.ButtonDefaults
import androidx.compose.material.OutlinedButton
import androidx.compose.material.Text
import androidx.compose.material.TextButton
import androidx.compose.material.IconButton
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.Icon
import androidx.compose.ui.graphics.Color

/**
 * Primary action button used for main call-to-actions.
 *
 * ![PrimaryButton Preview](images/PrimaryButton.png)
 *
 * This button represents the primary action on a screen and should be used sparingly
 * (typically once per screen).
 */
@Composable
fun PrimaryButton() {
    Button(
        onClick = {},
        colors = ButtonDefaults.buttonColors(backgroundColor = Color(0xFF6200EE))
    ) {
        Text("Primary Button", color = Color.White)
    }
}

/**
 * Secondary action button for alternative choices.
 *
 * ![SecondaryButton Preview](images/SecondaryButton.png)
 *
 * Use this button for secondary actions that are not the primary focus of the page.
 */
@Composable
fun SecondaryButton() {
    OutlinedButton(onClick = {}) {
        Text("Secondary Button", color = Color(0xFF6200EE))
    }
}

/**
 * Text-only button without borders or background.
 *
 * Ideal for less prominent actions, cards, or dialog footers.
 */
@Composable
fun TextButton() {
    TextButton(onClick = {}) {
        Text("Text Button", color = Color(0xFF6200EE))
    }
}

/**
 * Button containing only an icon.
 *
 * Used in app bars, toolbars, or inline actions where text description is not required.
 */
@Composable
fun IconButton() {
    IconButton(onClick = {}) {
        Icon(Icons.Filled.Favorite, contentDescription = "Favorite", tint = Color.Red)
    }
}

/**
 * Floating Action Button (FAB) for the primary screen action.
 *
 * Displays a circular button floating above the content, representing the most important action.
 */
@Composable
fun FloatingActionButton() {
    // FAB dummy implementation
}

/**
 * Outlined button with a border.
 *
 * Medium-emphasis button that is typically used for important, but not primary, actions.
 */
@Composable
fun OutlinedButton() {
    OutlinedButton(onClick = {}) {
        Text("Outlined Button")
    }
}

/**
 * Button with an active loading state.
 *
 * Displays a progress spinner indicating an asynchronous action is executing upon click.
 */
@Composable
fun LoadingButton() {
    // Button with a loading indicator
}

@Preview
@Composable
fun PrimaryButtonPreview() {
    PrimaryButton()
}

@Preview
@Composable
fun SecondaryButtonPreview() {
    SecondaryButton()
}



