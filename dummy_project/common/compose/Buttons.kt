package com.common.compose.button

import androidx.compose.runtime.Composable

/**
 * Primary action button used for main call-to-actions.
 *
 * This button represents the primary action on a screen and should be used sparingly
 * (typically once per screen).
 */
@Composable
fun PrimaryButton() {
    // Primary action button
}

/**
 * Secondary action button for alternative choices.
 *
 * Use this button for secondary actions that are not the primary focus of the page.
 */
@Composable
fun SecondaryButton() {
    // Secondary action button
}

/**
 * Text-only button without borders or background.
 *
 * Ideal for less prominent actions, cards, or dialog footers.
 */
@Composable
fun TextButton() {
    // Text-only button
}

/**
 * Button containing only an icon.
 *
 * Used in app bars, toolbars, or inline actions where text description is not required.
 */
@Composable
fun IconButton() {
    // Button with an icon
}

/**
 * Floating Action Button (FAB) for the primary screen action.
 *
 * Displays a circular button floating above the content, representing the most important action.
 */
@Composable
fun FloatingActionButton() {
    // FAB
}

/**
 * Outlined button with a border.
 *
 * Medium-emphasis button that is typically used for important, but not primary, actions.
 */
@Composable
fun OutlinedButton() {
    // Outlined action button
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

