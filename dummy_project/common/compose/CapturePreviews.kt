package com.common.compose

import androidx.compose.runtime.Composable
import androidx.compose.ui.ImageComposeScene
import androidx.compose.ui.use
import com.common.compose.button.*
import com.common.compose.card.*
import com.common.compose.indicator.*
import java.io.File
import org.jetbrains.skia.Image
import org.jetbrains.skia.EncodedImageFormat

fun main() {
    println("Starting Compose Preview Capture...")
    
    val previews = mapOf<String, @Composable () -> Unit>(
        "PrimaryButton" to { PrimaryButtonPreview() },
        "SecondaryButton" to { SecondaryButtonPreview() },
        "ProductCard" to { ProductCardPreview() },
        "UserCard" to { UserCardPreview() },
        "CircularProgressIndicator" to { CircularProgressIndicatorPreview() },
        "LinearProgressIndicator" to { LinearProgressIndicatorPreview() }
    )
    
    val outputDir = File("../docs/dokka/images")
    if (!outputDir.exists()) {
        outputDir.mkdirs()
    }
    
    previews.forEach { (name, composable) ->
        try {
            println("Capturing preview for: $name")
            capturePreview(name, outputDir, composable)
        } catch (e: Exception) {
            println("Failed to capture $name: ${e.message}")
            e.printStackTrace()
        }
    }
    println("Compose Preview Capture Finished successfully!")
}

fun capturePreview(name: String, outputDir: File, content: @Composable () -> Unit) {
    // Render off-screen (e.g. 300x120 size)
    ImageComposeScene(width = 300, height = 120).use { scene ->
        scene.setContent(content)
        val renderDoc = scene.render()
        val data = renderDoc.encodeToData(EncodedImageFormat.PNG, 100)
        if (data != null) {
            val bytes = data.bytes
            val outputFile = File(outputDir, "$name.png")
            outputFile.writeBytes(bytes)
        } else {
            throw Exception("Failed to encode Skia Image to PNG data")
        }
    }
}



