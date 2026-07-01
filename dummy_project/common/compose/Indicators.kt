package com.common.compose.indicator

import androidx.compose.runtime.Composable
import androidx.compose.desktop.ui.tooling.preview.Preview

/**
 * A circular progress indicator that represents a background task in progress.
 *
 * ![CircularProgressIndicator Preview](images/CircularProgressIndicator.png)
 *
 * This component displays a continuous circular animation indicating to the user that
 * an asynchronous operation is running (e.g., loading data, submitting a form).
 *
 * @param size The diameter of the indicator.
 * @param strokeWidth The thickness of the indicator's stroke.
 */
@Composable
fun CircularProgressIndicator(size: Int = 40, strokeWidth: Int = 4) {
    // Dummy circular progress indicator
}

/**
 * A linear progress indicator that displays the progress of a specific task.
 *
 * ![LinearProgressIndicator Preview](images/LinearProgressIndicator.png)
 *
 * Use this component when you can measure the progress (from 0.0 to 1.0) of an ongoing task,
 * such as downloading a file or uploading media.
 *
 * @param progress The current progress value, ranging from 0.0 to 1.0.
 */
@Composable
fun LinearProgressIndicator(progress: Float) {
    // Dummy linear progress indicator
}

@Preview
@Composable
fun CircularProgressIndicatorPreview() {
    CircularProgressIndicator()
}

@Preview
@Composable
fun LinearProgressIndicatorPreview() {
    LinearProgressIndicator(0.5f)
}

