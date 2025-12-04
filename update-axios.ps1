# PowerShell script to update all files to use centralized axios config
# Run this from the frontend directory

Write-Host "Starting axios configuration update..." -ForegroundColor Green

# List of files to update
$filesToUpdate = @(
    "src\store\slices\enrollmentSlice.ts",
    "src\store\slices\assignmentSlice.ts",
    "src\store\slices\userManagementSlice.ts",
    "src\store\slices\courseSlice.ts",
    "src\store\slices\authSlice.ts",
    "src\pages\StudentDashboard.tsx",
    "src\pages\QuizTaking.tsx",
    "src\pages\CourseLearning.tsx",
    "src\pages\CourseDetailsPage.tsx",
    "src\pages\AdminDashboard.tsx",
    "src\pages\admin\QuizManagement.tsx",
    "src\pages\admin\QuizForm.tsx",
    "src\pages\admin\Assignments.tsx"
)

foreach ($file in $filesToUpdate) {
    if (Test-Path $file) {
        Write-Host "Processing: $file" -ForegroundColor Yellow
        
        $content = Get-Content $file -Raw
        
        # Replace axios import
        $content = $content -replace 'import axios from ["\']axios["\'];', 'import axios from "../config/axios.config";'
        $content = $content -replace 'import axios from ["\']\.\./\.\./config/axios\.config["\'];', 'import axios from "../../config/axios.config";'
        $content = $content -replace 'import axios from ["\']\.\.\/config/axios\.config["\'];', 'import axios from "../config/axios.config";'
        
        # Remove API_URL constant lines
        $content = $content -replace 'const API_URL = ["\']\/api["\'];[\r\n]+', ''
        $content = $content -replace 'const API_URL = ["\']https:\/\/course-master-backend-chi\.vercel\.app\/api["\'];[\r\n]+', ''
        
        # Remove ${API_URL} from axios calls
        $content = $content -replace '\$\{API_URL\}\/', '/'
        
        # Remove withCredentials: true from axios calls (it's now global)
        $content = $content -replace ',\s*\{\s*withCredentials:\s*true\s*\}', ''
        $content = $content -replace '\{\s*withCredentials:\s*true\s*\},?\s*', ''
        
        # Save the file
        Set-Content $file -Value $content -NoNewline
        
        Write-Host "✓ Updated: $file" -ForegroundColor Green
    } else {
        Write-Host "✗ File not found: $file" -ForegroundColor Red
    }
}

Write-Host "`nUpdate complete!" -ForegroundColor Green
Write-Host "Please review the changes and test your application." -ForegroundColor Cyan
