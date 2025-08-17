# Cloudinary Setup for UCAES Systems

## Overview
This document explains how to set up Cloudinary for document uploads in the UCAES systems. We use **separate Cloudinary accounts** for different systems to ensure security and organization.

## System Separation

### 🎓 Admissions System
- **Cloud Name**: `dyvabxsvh`
- **API Key**: `976451452252245`
- **API Secret**: `K_ul_YNOfbBvkOprTguVfgpA-Qk`
- **Upload Preset**: `ucaes_admissions`
- **Documents**: Passport photos, ID documents, certificates, transcripts

### 📚 Academic Affairs System
- **Cloud Name**: `dxkkv9nbn`
- **API Key**: `281612645352281`
- **API Secret**: `wa0BPGAqDXUR9KOVxiu2G5oEhWk`
- **Upload Preset**: `ucaes_academic_affairs`
- **Documents**: Assignments, projects, academic records, course materials

## Prerequisites
1. Two separate Cloudinary accounts (sign up at https://cloudinary.com/)
2. Node.js and npm installed

## Setup Steps

### 1. Install Dependencies
```bash
npm install cloudinary multer
```

### 2. Cloudinary Dashboard Setup

#### 2.1 Admissions System Setup
1. Log in to your **Admissions Cloudinary account**
2. Go to "Settings" > "Upload" in your Cloudinary dashboard
3. Scroll down to "Upload presets"
4. Click "Add upload preset"
5. Set the following:
   - **Preset name**: `ucaes_admissions`
   - **Signing Mode**: `Unsigned` (for client-side uploads)
   - **Folder**: `ucaes/admissions`
   - **Allowed formats**: `jpg, jpeg, png, pdf`
   - **Max file size**: `5MB`

#### 2.2 Academic Affairs System Setup
1. Log in to your **Academic Affairs Cloudinary account**
2. Go to "Settings" > "Upload" in your Cloudinary dashboard
3. Scroll down to "Upload presets"
4. Click "Add upload preset"
5. Set the following:
   - **Preset name**: `ucaes_academic_affairs`
   - **Signing Mode**: `Unsigned` (for client-side uploads)
   - **Folder**: `ucaes/academic-affairs`
   - **Allowed formats**: `jpg, jpeg, png, pdf, doc, docx, xls, xlsx, txt`
   - **Max file size**: `10MB`

### 3. Security Considerations

#### 3.1 Account Separation
- **Never share credentials** between systems
- Each system has its own isolated storage
- Different access controls for different teams

#### 3.2 Upload Preset Security
- Use unsigned uploads for client-side uploads
- Set appropriate folder structure for organization
- Limit file types and sizes per system

#### 3.3 Environment Variables
- Never commit your credentials to version control
- Use different credentials for development and production
- Rotate API keys regularly

### 4. Usage

#### 4.1 Admissions System
The Admissions system supports:
- **Automatic uploads**: Documents are uploaded to Cloudinary when selected
- **Progress indicators**: Shows upload progress and status
- **Error handling**: Displays upload errors with retry options
- **Document preview**: Users can view uploaded documents
- **File validation**: Validates file type and size before upload

#### 4.2 Academic Affairs System
The Academic Affairs system supports:
- **Course-specific uploads**: Documents organized by course and semester
- **Multiple file types**: Support for academic documents (PDF, DOC, XLS, etc.)
- **Larger file sizes**: Up to 10MB for academic documents
- **Semester organization**: Documents organized by academic periods

### 5. File Structure

#### 5.1 Admissions System
Documents are organized in Cloudinary as:
```
ucaes/
  admissions/
    {userId}/
      photo/
      idDocument/
      certificate/
      transcript/
```

#### 5.2 Academic Affairs System
Documents are organized in Cloudinary as:
```
ucaes/
  academic-affairs/
    {userId}/
      assignment/
        {courseId}/
          {semester}/
      project/
        {courseId}/
          {semester}/
      academic-record/
      course-material/
        {courseId}/
          {semester}/
      research-paper/
```

### 6. Features

#### 6.1 Document Types Supported

**Admissions System:**
- **Passport Photo**: Recent passport-sized photograph
- **National ID/Passport**: Government-issued identification
- **Academic Certificate**: Latest qualification certificate
- **Academic Transcript**: Official academic records

**Academic Affairs System:**
- **Assignments**: Course assignments and homework
- **Projects**: Academic projects and research
- **Academic Records**: Official academic documentation
- **Course Materials**: Lecture notes and materials
- **Research Papers**: Academic research documents

#### 6.2 File Validation

**Admissions System:**
- **Maximum size**: 5MB per document
- **Allowed formats**: PDF, JPG, PNG
- **Automatic validation**: Before upload

**Academic Affairs System:**
- **Maximum size**: 10MB per document
- **Allowed formats**: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX, TXT
- **Automatic validation**: Before upload

#### 6.3 Upload States
- **Uploading**: Shows spinner and progress
- **Success**: Shows checkmark and document link
- **Error**: Shows error message with retry option

### 7. Troubleshooting

#### Common Issues:
1. **Upload fails**: Check API credentials and upload preset
2. **File too large**: Ensure file is under size limit for the system
3. **Invalid format**: Check allowed formats for the system
4. **Network errors**: Check internet connection

#### Debug Steps:
1. Check browser console for errors
2. Verify credentials are set correctly for each system
3. Test upload preset in Cloudinary dashboard
4. Check network tab for failed requests

### 8. Production Deployment

#### 8.1 Environment Variables
Ensure all environment variables are set in your production environment for both systems.

#### 8.2 CORS Configuration
If needed, configure CORS in your Cloudinary settings for your domain.

#### 8.3 Monitoring
Monitor upload success rates and errors in your application logs for both systems.

## Support
For issues with Cloudinary integration, check:
1. Cloudinary documentation: https://cloudinary.com/documentation
2. Application logs for error details
3. Network tab in browser developer tools
4. Verify correct credentials are being used for each system 