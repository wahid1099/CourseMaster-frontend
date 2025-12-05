# Fix Axios Imports Script
# This script updates all axios imports to use the configured instance

$files = @(
    "src\store\slices\userManagementSlice.ts",
    "src\store\slices\enrollmentSlice.ts",
    "src\store\slices\courseSlice.ts",
    "src\store\slices\authSlice.ts",
    "src\store\slices\assignmentSlice.ts",
    "src\pages\QuizTaking.tsx",
    "src\pages\CourseLearning.tsx",
    "src\pages\CourseDetailsPage.tsx",
    "src\pages\AdminDashboard.tsx",
    "src\pages\admin\SupportDashboard.tsx",
    "src\pages\admin\QuizManagement.tsx",
    "src\pages\admin\QuizForm.tsx",
    "src\pages\admin\Assignments.tsx",
    "src\components\ChatWidget.tsx"
)

foreach ($file in $files) {
    $fullPath = "d:\projects\misun-academy\frontend\$file"
    
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        
        # Calculate relative path to axios.config.ts
        $depth = ($file -split '\\').Count - 2
        $relativePath = "../" * $depth + "config/axios.config"
        
        # Replace the import
        $newContent = $content -replace 'import axios from "axios";', "import axios from `"$relativePath`";"
        
        Set-Content $fullPath -Value $newContent -NoNewline
        
        Write-Host "Updated: $file"
    }
}

Write-Host "`nAll files updated successfully!"
