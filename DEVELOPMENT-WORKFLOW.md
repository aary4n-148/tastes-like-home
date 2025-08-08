# 🛠️ Development Workflow & Preferences

## Overview
This document captures the preferred development workflow and practices for the Tastes Like Home project. Follow these guidelines when implementing changes to ensure consistency with established patterns.

---

## 🎯 Core Development Philosophy

### Keep It Simple
- **"Keep things simple"** - Always prioritize simple, maintainable solutions over complex ones
- Avoid over-engineering - ship fast with minimal viable implementations that can be extended later
- Focus on getting V1 working first, then iterate

### Step-by-Step Execution
- **One step at a time** - Never jump ahead or implement multiple phases simultaneously
- Wait for explicit confirmation before proceeding to the next step
- Explain the "what" and "why" of each change in simple, clear language (Feynman's rule)
- **"Job depends on it" accuracy** - Be precise with commands and explanations

---

## 🔄 Git Best Practices

### Branching Strategy
```bash
# Always create feature branches for new work
git checkout -b feature/descriptive-name

# Use descriptive branch names that explain the feature
# Examples: feature/enhanced-chef-profiles, feature/payment-integration
```

### Commit Standards
- **Staged commits** - Add files explicitly before committing
- **Descriptive commit messages** - Explain what and why, not just what
- Use conventional commit format when appropriate:
  ```
  feat: Add enhanced chef profile fields
  fix: Resolve chef deletion constraint violation
  docs: Update development workflow guide
  ```

### Professional Git Workflow
```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes and stage them
git add specific-files

# 3. Commit with descriptive messages
git commit -m "feat: descriptive message explaining the change"

# 4. When feature is complete, merge to main
git checkout main
git merge feature/new-feature

# 5. Push to origin
git push origin main

# 6. Clean up feature branch (optional)
git branch -d feature/new-feature
```

---

## 🏗️ Implementation Approach

### Phase-by-Phase Development
Break large features into clear phases:

1. **Phase 1: Database/Backend Changes**
   - Add new tables, columns, or constraints
   - Update server actions and API endpoints
   - Test database operations in isolation

2. **Phase 2: UI/Frontend Changes**
   - Update components and pages
   - Implement new forms or displays
   - Focus on user experience and design

3. **Phase 3: Integration & Testing**
   - Connect frontend to backend
   - Test complete user flows
   - Fix any data flow issues

4. **Phase 4: Admin Interface Updates**
   - Update admin panels to manage new features
   - Ensure admins can edit/manage new data
   - Test admin workflows

### Task Management
- Use TODO lists to track progress and give visibility into work
- Mark tasks as completed immediately when finished
- Only work on one task at a time to maintain focus

---

## 🗄️ Database Philosophy

### SQL Simplicity
- **"No need to add complexity"** - Keep SQL migrations simple and focused
- Use straightforward INSERT/UPDATE/ALTER statements
- Avoid complex stored procedures or triggers unless absolutely necessary

### Data Migration Strategy
- Always provide sample/test data for new fields
- Use realistic fake data that represents actual use cases
- Ensure new fields have proper validation and constraints

### Foreign Key Management
- Handle foreign key relationships properly when deleting records
- Delete child records before parent records to avoid constraint violations
- Always test deletion workflows thoroughly

---

## 🎨 UI/UX Principles

### Design Standards
- **"World-class design"** - Aim for marketplace-quality UI (think Airbnb, Thumbtack)
- **"Trustworthy, easy to scan, and conversion-optimised"** - Focus on user psychology
- Use proven UX patterns from successful marketplaces
- Prioritize mobile-first responsive design

### Layout Preferences
- Avoid walls of text - break content into scannable sections
- Use icons to improve scanning speed (~30% improvement)
- Balance image and content proportions carefully
- Minimize white space while maintaining clean design

### Form Design
- **Keep forms simple for end users** - Minimize friction for chefs and customers
- Use helpful placeholder text and examples
- Provide clear guidance and tips where needed
- Make validation errors clear and actionable

---

## 🔧 Technical Patterns

### Error Handling
- Always handle errors gracefully with user-friendly messages
- Log errors for debugging but don't expose technical details to users
- Provide fallback states when data is missing or loading

### State Management
- Use React state patterns consistently
- Handle loading, success, and error states explicitly
- Revalidate caches after data changes with `revalidatePath()`

### Code Organization
- Follow existing file structure and naming conventions
- Keep components focused and single-purpose
- Extract reusable logic into utility functions

---

## 🚀 Deployment Practices

### Environment Management
- Keep development and production environment variables clearly separated
- Document all required environment variables
- Test features thoroughly in development before deploying

### Production Readiness
- Remove all debug logging before merging to main
- Test complete user flows end-to-end
- Verify backwards compatibility with existing data

---

## 🔍 Testing Philosophy

### Manual Testing Priority
- Test complete user journeys, not just individual functions
- Always test from the perspective of different user types (chef, customer, admin)
- Verify data persistence throughout the entire flow

### Common Test Scenarios
1. **New Feature Flow**: Apply → Admin Review → Approval → Public Display
2. **Edit Existing Data**: Admin Edit → Save → Verify Changes Live
3. **Error Handling**: Invalid inputs, network issues, missing data
4. **Mobile Experience**: Test responsive design on different screen sizes

---

## 💬 Communication Style

### Explanations
- Use simple, clear language (Feynman's principle)
- Explain both what is being done and why it's necessary
- Provide context for technical decisions
- Never assume prior knowledge

### Progress Updates
- Give regular status updates during implementation
- Explain what was completed and what's next
- Ask for confirmation before proceeding to new phases

---

## 🏆 Success Criteria

### Definition of Done
A feature is complete when:
- ✅ All phases implemented and tested
- ✅ Data flows correctly end-to-end
- ✅ Admin interface allows full management
- ✅ No data loss in any workflow
- ✅ Mobile-responsive and professional design
- ✅ Deployed to production successfully
- ✅ Documentation updated

### Quality Standards
- Code follows existing patterns and conventions
- All edge cases handled gracefully
- Performance is acceptable on mobile devices
- Backwards compatibility maintained
- Security best practices followed

---

## 📝 Notes for Future Development

### Preferred Stack & Tools
- **Frontend**: Next.js with TypeScript, React Server Components
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Deployment**: Vercel with GitHub integration
- **Email**: Resend API for transactional emails

### Common Patterns to Follow
- Server Actions for form submissions and admin operations
- Client Components only when necessary (forms, interactive elements)
- Consistent error handling with try/catch blocks
- Cache revalidation after data mutations
- TypeScript interfaces for data structures

---

*This document should be updated as new patterns emerge or preferences change. It serves as a guide for maintaining consistency and quality across the project.*
