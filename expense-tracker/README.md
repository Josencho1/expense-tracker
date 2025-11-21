# Expense Tracker

A modern, professional expense tracking web application built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

### Core Functionality
- **Add Expenses**: Create new expenses with date, amount, category, and description
- **Edit Expenses**: Update existing expenses with a simple click
- **Delete Expenses**: Remove expenses you no longer need
- **Filter & Search**: Find expenses by date range, category, or search query
- **Data Persistence**: All data is stored in localStorage for seamless experience

### Dashboard & Analytics
- **Summary Cards**: View total spending, monthly spending, and top category at a glance
- **Visual Charts**: Interactive bar charts and pie charts showing spending patterns
- **Category Breakdown**: Detailed breakdown of spending by category with percentages
- **Export to CSV**: Download your expense data in CSV format

### Categories
- Food
- Transportation
- Entertainment
- Shopping
- Bills
- Other

## Technical Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Form Management**: React Hook Form
- **Date Handling**: date-fns
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+ installed on your system
- npm, yarn, or pnpm package manager

### Installation

1. Navigate to the expense-tracker directory:
```bash
cd expense-tracker
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Building for Production

```bash
npm run build
npm start
```

## Testing the Application

### Test Scenario 1: Add Expenses
1. Click the "Add Expense" button in the top right
2. Fill in the form:
   - Select a date
   - Enter an amount (e.g., 45.99)
   - Choose a category (e.g., Food)
   - Add a description (e.g., "Lunch at restaurant")
3. Click "Add Expense"
4. Verify the expense appears in the list

### Test Scenario 2: Filter Expenses
1. Add multiple expenses with different categories and dates
2. Use the search box to find specific expenses
3. Filter by category using the dropdown
4. Set date ranges to view expenses within specific periods
5. Click "Reset Filters" to clear all filters

### Test Scenario 3: Edit Expenses
1. Click the edit icon (pencil) next to any expense
2. Modify the details
3. Click "Update"
4. Verify the changes are reflected in the list

### Test Scenario 4: Delete Expenses
1. Click the delete icon (trash) next to any expense
2. Confirm the deletion in the popup
3. Verify the expense is removed from the list

### Test Scenario 5: Export Data
1. Click the "Export CSV" button
2. Check your downloads folder for the CSV file
3. Open the CSV to verify all expense data is included

### Test Scenario 6: Dashboard Analytics
1. Add expenses across different categories
2. Observe the dashboard cards updating:
   - Total Spending shows sum of all expenses
   - This Month shows current month's spending
   - Top Category displays the category with highest spending
3. Check the charts:
   - Bar chart shows spending by category
   - Pie chart shows percentage distribution

### Test Scenario 7: Responsive Design
1. Resize your browser window to mobile size
2. Verify the layout adapts properly
3. Test all features on mobile view
4. Check that the table switches to card view on small screens

## Project Structure

```
expense-tracker/
├── app/
│   ├── layout.tsx          # Root layout component
│   ├── page.tsx            # Main page component
│   └── globals.css         # Global styles
├── components/
│   ├── Dashboard.tsx       # Summary cards component
│   ├── ExpenseChart.tsx    # Charts component
│   ├── ExpenseFilter.tsx   # Filter and search component
│   ├── ExpenseForm.tsx     # Add/edit expense form
│   └── ExpenseList.tsx     # Expense list table
├── lib/
│   ├── storage.ts          # localStorage utilities
│   └── utils.ts            # Helper functions
├── types/
│   └── expense.ts          # TypeScript type definitions
└── public/                 # Static assets
```

## Features in Detail

### Form Validation
- All fields are required
- Amount must be greater than 0
- Description must be at least 3 characters
- Real-time validation feedback

### Currency Formatting
- All amounts displayed in USD format
- Automatic decimal formatting
- Proper thousand separators

### Date Handling
- User-friendly date display
- Date range filtering
- Automatic sorting by date

### Data Persistence
- All data stored in browser's localStorage
- Automatic save on every action
- No data lost on page refresh

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Future Enhancements

Potential features for future versions:
- Multiple currency support
- Budget setting and tracking
- Recurring expenses
- Receipt image uploads
- Cloud sync across devices
- Advanced analytics and insights
- Custom categories
- Dark mode

## License

This project is open source and available for personal and educational use.

## Support

For issues or questions, please create an issue in the repository.
