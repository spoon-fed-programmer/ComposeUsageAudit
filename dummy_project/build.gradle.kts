plugins {
    kotlin("jvm") version "2.0.20"
    id("org.jetbrains.dokka") version "1.9.20"
}

repositories {
    google()
    mavenCentral()
}

dependencies {
    // Avoid compile errors on @Composable annotation
    implementation("androidx.compose.runtime:runtime:1.6.8")
}

kotlin {
    sourceSets {
        main {
            kotlin.setSrcDirs(listOf("common/compose"))
        }
    }
}

tasks.dokkaHtml {
    outputDirectory.set(file("${rootDir}/../docs/dokka"))
}
