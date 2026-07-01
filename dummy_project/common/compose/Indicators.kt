package com.common.compose.indicator

import androidx.compose.runtime.Composable
import androidx.compose.desktop.ui.tooling.preview.Preview
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.size
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.dp

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
    Canvas(modifier = Modifier.size(size.dp)) {
        // Gray background track
        drawCircle(
            color = Color.LightGray,
            style = Stroke(width = strokeWidth.dp.toPx())
        )
        // Violet active progress segment (120 degrees arc)
        drawArc(
            color = Color(0xFF6200EE),
            startAngle = -90f,
            sweepAngle = 120f,
            useCenter = false,
            style = Stroke(width = strokeWidth.dp.toPx())
        )
    }
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
    Canvas(modifier = Modifier.size(width = 150.dp, height = 8.dp)) {
        val width = size.width
        val height = size.height
        val stroke = height
        
        // Gray background track line
        drawLine(
            color = Color.LightGray,
            start = Offset(0f, height / 2),
            end = Offset(width, height / 2),
            strokeWidth = stroke
        )
        // Violet active progress line
        drawLine(
            color = Color(0xFF6200EE),
            start = Offset(0f, height / 2),
            end = Offset(width * progress, height / 2),
            strokeWidth = stroke
        )
    }
}

/** @suppress */
@Preview
@Composable
fun CircularProgressIndicatorPreview() {
    CircularProgressIndicator()
}

/** @suppress */
@Preview
@Composable
fun LinearProgressIndicatorPreview() {
    LinearProgressIndicator(0.5f)
}





