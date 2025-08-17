# 🧪 **Testing Mature Student Application - Complete Guide**

## 🎯 **How to Test the Mature Student System**

### **Option 1: Test as a Student (Applicant)**

#### **Step 1: Create a Mature Student Account**
1. **Go to**: UCAES Admission Portal
2. **Click**: "Register" 
3. **Fill in**:
   - **Email**: `mature.student@test.com`
   - **Password**: `TestPassword123`
   - **Name**: `Mary Asante`
   - **Role**: `applicant` (default)
4. **Register** and login

#### **Step 2: Start Application Process**
1. **Go to**: `Dashboard → Application`
2. **Fill Personal Info**:
   - **Name**: Mary Asante
   - **Date of Birth**: `10-08-1992` (makes her 32 years old)
   - **Gender**: Female
   - **Nationality**: Ghanaian
   - **Region**: Greater Accra
   - **Upload**: Passport photo
3. **Click**: "Next"

#### **Step 3: Application Type Selection (NEW!)**
🎯 **This is where the magic happens!**

Since the date of birth shows age 32 (21+), the system will show:

```
┌──────────────────────────────���──────────────────────────────────────────────┐
│                     APPLICATION TYPE SELECTION                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Your Age: 32 years old                                                    │
│  • You may be eligible for mature student admission                        │
│                                                                             │
│  ┌─────────────────────┐    ┌─────────────────────┐                        │
│  │  👥 Traditional     │    │  🎓 Mature Student  │                        │
│  │     Student         │    │                     │                        │
│  │                     │    │  ✅ Age 21+         │                        │
│  │  • Standard WAEC    │    │  ✅ Work Experience │                        │
│  │  • Academic pathway │    │  ✅ Alternative     │                        │
│  │  • Age under 21     │    │      Entry          │                        │
│  │                     │    │  ✅ Support Services│                        │
│  └─────────────────────┘    └─────────────────────┘                        │
│                                                                             │
│  [Continue as Traditional] [Continue as Mature Student] ◄── Choose this    │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Select**: "Continue as Mature Student"

#### **Step 4: Mature Student Information Form**
You'll now see a **4-section form**:

**Section 1: Eligibility & Background**
- **Eligibility Type**: Work Experience
- **Employment Status**: Employed
- **Study Time Available**: 15-20 hours per week
- **Family Responsibilities**: Yes (2 children)

**Section 2: Work Experience & Skills**
- **Add Work Experience**:
  - **Employer**: Green Valley Farms
  - **Position**: Farm Manager
  - **Start Date**: 2019-01
  - **End Date**: 2024-01
  - **Current Job**: No
  - **Responsibilities**: "Managed 50-hectare organic farm, supervised 15 workers, increased crop yield by 30%"
- **Total Work Years**: 8
- **Professional Qualifications**:
  - **Qualification**: Organic Farming Certificate
  - **Institution**: Ghana Organic Agriculture Network
  - **Year**: 2020
  - **Relevant**: Yes
- **Relevant Skills**: [Organic Farming] [Team Management] [Crop Production]
- **Volunteer Work**: "Community garden coordinator for 3 years"

**Section 3: Motivation & Goals**
- **Personal Statement**: "After 8 years of practical farming, I want to deepen my knowledge through formal education to establish a sustainable agriculture consultancy..."
- **Career Goals**: "Establish sustainable agriculture consultancy to help small-scale farmers"
- **Why This Program**: "B.Sc. Sustainable Agriculture will provide the theoretical foundation to complement my practical experience"

**Section 4: Support Needs & Summary**
- **Need Support**: Yes
- **Support Types**: [Study Skills Training] [Flexible Scheduling]
- **Has Disability**: No
- **Review and Submit**

#### **Step 5: Mature Student Document Upload**
You'll see **6 document categories**:

**Category 1: Identity Documents** ✅ Required
- Upload National ID
- Upload Passport Photo

**Category 2: Work Experience Documents** ✅ Required
- Upload Employment Letter from Green Valley Farms
- Upload Recent Pay Slip
- Upload Work Certificate

**Category 3: Professional Qualifications**
- Upload Organic Farming Certificate

**Category 4: Educational Background** (Optional)
- Skip if no formal education

**Category 5: Supporting Documents**
- Upload Personal Motivation Letter
- Upload Reference Letter from Previous Employer
- Upload Reference Letter from Community Leader

**Category 6: Special Circumstances** (Optional)
- Skip if none

#### **Step 6: Program Selection**
- **First Choice**: B.Sc. Sustainable Agriculture
- **Study Mode**: Weekend (flexible for working adults)
- **Level**: 100 (First Year)

#### **Step 7: Payment & Submit**
- Complete payment
- Submit application

---

### **Option 2: Test as Staff (Admission Officer)**

#### **Step 1: Login as Staff**
1. **Use staff credentials** or create staff account
2. **Role**: `staff`

#### **Step 2: View Applications**
1. **Go to**: `Staff → Applications`
2. **Look for**: The mature student application you just created

#### **Step 3: What You Should See**
```
Applications (6)

Applicant                    Type & Eligibility         Program           Status
─────────────────────────────────────────────────────────────────────────────
👤 Mary Asante (32) 🎓      💼 WORK EXPERIENCE         B.Sc Sustain      🟣 Submitted
   APP-2024-155                8 years exp             Weekend           ❤️ 2 services
   mature.student@test.com                                               Study Skills
                                                                         Flexible Sched
```

#### **Step 4: Test Filtering**
- **Filter by**: Application Type → "Mature Students"
- **Should show**: Only Mary Asante's application
- **Filter by**: "All Types"
- **Should show**: All applications mixed together

#### **Step 5: View Application Details**
1. **Click**: 👁️ "View" on Mary Asante's application
2. **Should see**: Enhanced mature student profile with:
   - Work experience timeline
   - Professional qualifications
   - Personal statement
   - Support service requests
   - All uploaded documents

#### **Step 6: Test Actions**
- **Click**: ✅ "Accept" or ❌ "Reject"
- **Status should update** in the table

---

## 🎯 **Quick Test Scenarios**

### **Scenario A: Young Student (Traditional Path)**
- **Age**: 19 years old
- **Expected**: No mature student selection, goes straight to contact info
- **Shows as**: Traditional student in staff view

### **Scenario B: Older Student Chooses Traditional**
- **Age**: 25 years old
- **Chooses**: Traditional pathway despite age warning
- **Shows as**: Traditional student in staff view

### **Scenario C: Mature Student (Work Experience)**
- **Age**: 32 years old
- **Chooses**: Mature student pathway
- **Eligibility**: Work experience
- **Shows as**: Mature student with work experience icon

### **Scenario D: Mature Student (Professional Qualification)**
- **Age**: 28 years old
- **Chooses**: Mature student pathway
- **Eligibility**: Professional qualification
- **Shows as**: Mature student with award icon

---

## 🔧 **Testing Checklist**

### **✅ Student Application Flow:**
- [ ] Age detection works (21+ shows selection screen)
- [ ] Mature student selection appears
- [ ] 4-section mature student form loads
- [ ] 6-category document upload works
- [ ] All data saves properly
- [ ] Application submits successfully

### **✅ Staff View:**
- [ ] Statistics show mature student counts
- [ ] Blue "Mature" badges appear
- [ ] Different eligibility icons show
- [ ] Support alerts display
- [ ] Filtering works correctly
- [ ] Detail view shows enhanced information

### **✅ Database Integration:**
- [ ] Mature student data saves to Firebase
- [ ] Documents upload to Cloudinary
- [ ] Status updates work
- [ ] Search and filtering work

---

## 🚨 **Common Issues & Solutions**

### **Issue: No Mature Student Selection**
- **Check**: Date of birth format (dd-mm-yyyy)
- **Verify**: Age calculation is correct
- **Solution**: Use birth date that makes person 21+

### **Issue: Forms Don't Load**
- **Check**: Browser console for errors
- **Solution**: Refresh page, clear cache

### **Issue: Documents Won't Upload**
- **Check**: File size (max 5MB)
- **Check**: File format (PDF, JPG, PNG)
- **Solution**: Use smaller, supported files

### **Issue: Staff Can't See Applications**
- **Check**: Logged in with 'staff' role
- **Check**: URL is `/staff/applications`
- **Solution**: Verify role and navigation

---

## 📱 **Test on Different Devices**

### **Desktop Testing:**
- Full functionality
- All features visible
- Complete workflow

### **Mobile Testing:**
- Responsive design
- Touch-friendly interface
- Simplified navigation

### **Tablet Testing:**
- Medium screen optimization
- Touch and keyboard input
- Landscape/portrait modes

---

## 🎯 **Expected Results**

### **✅ Successful Test Indicators:**
1. **Age-based routing** works automatically
2. **Mature student forms** load and save data
3. **Document upload** works with Cloudinary
4. **Staff view** shows enhanced information
5. **Filtering** separates mature from traditional students
6. **Status updates** work for all application types
7. **Support alerts** appear for students needing assistance

### **📊 Sample Data Included:**
The system includes sample mature student applications so you can immediately see:
- Mary Asante (32) - Work Experience pathway
- Kwame Osei (28) - Professional Qualification pathway  
- Emmanuel Tetteh (45) - Life Experience pathway

---

## 🚀 **Ready to Test!**

The mature student system is fully integrated and ready for testing. You can test both the student application flow and the staff review process using the scenarios above.

**Start with**: Creating a mature student account and going through the application process, then switch to staff view to see how it appears in the admission system.