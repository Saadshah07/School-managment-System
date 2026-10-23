import React, { useState } from 'react';
import {
  CreditCard,
  DollarSign,
  Plus,
  Search,
  Filter,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Download,
  Send,
  Sparkles,
  FileText,
  X,
  History
} from 'lucide-react';
import type { FeeInvoice, FeePaymentTransaction, Student, ClassGrade } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';

interface FeesViewProps {
  invoices: FeeInvoice[];
  students: Student[];
  classes: ClassGrade[];
  onRefresh: () => void;
}

export const FeesView: React.FC<FeesViewProps> = ({ invoices, students, classes, onRefresh }) => {
  const { canManageFees, currentRole, currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'invoices' | 'defaulters' | 'receipts'>('invoices');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Payment Collection Modal State
  const [payingInvoice, setPayingInvoice] = useState<FeeInvoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank Transfer' | 'Cheque' | 'Online'>('Cash');
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentRemarks, setPaymentRemarks] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Receipt Modal State
  const [viewingReceipt, setViewingReceipt] = useState<{ invoice: FeeInvoice; receipt: FeePaymentTransaction } | null>(null);

  // New Invoice Modal State
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [invoiceStudentId, setInvoiceStudentId] = useState(students[0]?.id || '');
  const [invoiceTerm, setInvoiceTerm] = useState('Fall Term (Nov 2026)');
  const [invoiceDueDate, setInvoiceDueDate] = useState('2026-11-15');
  const [tuitionFee, setTuitionFee] = useState(480);
  const [labFee, setLabFee] = useState(80);
  const [activityFee, setActivityFee] = useState(40);
  const [discountPercent, setDiscountPercent] = useState(0);

  // AI Parent Fee Reminder Modal State
  const [aiNoticeStudent, setAiNoticeStudent] = useState<Student | null>(null);
  const [aiNoticeText, setAiNoticeText] = useState('');
  const [generatingAiNotice, setGeneratingAiNotice] = useState(false);

  // Filter invoices
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.studentName.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      inv.admissionNo.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const defaulters = invoices.filter(i => i.status === 'Overdue' || (i.status === 'Partial' && i.remainingBalance > 0));

  const totalCollected = invoices.reduce((acc, i) => acc + i.paidAmount, 0);
  const totalOutstanding = invoices.reduce((acc, i) => acc + i.remainingBalance, 0);

  // Payment submission
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice) return;
    setIsSubmittingPayment(true);
    try {
      const res = await api.payInvoice({
        invoiceId: payingInvoice.id,
        amount: Number(paymentAmount),
        paymentMethod,
        transactionRef,
        remarks: paymentRemarks
      });
      setPayingInvoice(null);
      setViewingReceipt(res);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Payment failed.');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Create invoice submission
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === invoiceStudentId);
    if (!student) return;

    const items = [
      { description: 'Tuition Fee', amount: Number(tuitionFee) },
      { description: 'Science & Computer Lab Fee', amount: Number(labFee) },
      { description: 'Campus Activity Fund', amount: Number(activityFee) }
    ];
    const subtotal = items.reduce((acc, i) => acc + i.amount, 0);
    const discountAmount = Math.round((subtotal * discountPercent) / 100);
    const totalAmount = subtotal - discountAmount;

    try {
      await api.createInvoice({
        studentId: student.id,
        studentName: student.fullName,
        admissionNo: student.admissionNo,
        classId: student.classId,
        className: student.className,
        sectionName: student.sectionName,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: invoiceDueDate,
        term: invoiceTerm,
        items,
        subtotal,
        discountAmount,
        discountReason: discountPercent > 0 ? `Scholarship (${discountPercent}%)` : undefined,
        lateFee: 0,
        totalAmount
      });
      setIsNewInvoiceOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to generate invoice.');
    }
  };

  // Generate AI notice
  const handleTriggerAiNotice = async (inv: FeeInvoice) => {
    const student = students.find(s => s.id === inv.studentId);
    if (!student) return;
    setAiNoticeStudent(student);
    setGeneratingAiNotice(true);
    try {
      const notice = await api.generateParentNotice(student.fullName, student.parentName, 'fee_overdue', {
        amount: inv.remainingBalance,
        dueDate: inv.dueDate
      });
      setAiNoticeText(notice);
    } catch (err: any) {
      setAiNoticeText(`Dear ${student.parentName}, please note that an outstanding school fee balance of $${inv.remainingBalance} is due for ${student.fullName}. Kindly arrange clearance.`);
    } finally {
      setGeneratingAiNotice(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Institutional Accounts & Fee Billing</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit-trailed invoicing, partial installment collections, and printable bank vouchers
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tabs */}
          <div className="bg-slate-100 p-1 rounded-xl flex text-xs font-semibold">
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'invoices' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              All Invoices ({invoices.length})
            </button>
            <button
              onClick={() => setActiveTab('defaulters')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'defaulters' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Defaulters ({defaulters.length})
            </button>
          </div>

          {canManageFees && (
            <button
              onClick={() => setIsNewInvoiceOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Issue New Invoice</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Invoiced</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-800">${(totalCollected + totalOutstanding).toLocaleString()}</span>
            <span className="text-xs text-slate-400 ml-1">USD</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Collected</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-emerald-600">${totalCollected.toLocaleString()}</span>
            <span className="text-xs text-emerald-600 font-semibold ml-1">Settled</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Outstanding Balance</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-rose-600">${totalOutstanding.toLocaleString()}</span>
            <span className="text-xs text-rose-600 font-semibold ml-1">Receivable</span>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice number, student name, admission..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {activeTab === 'invoices' && (
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
            >
              <option value="all">All Invoices</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Overdue">Overdue</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Invoices / Defaulters Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase text-[11px]">
            <tr>
              <th className="py-3 px-4">Invoice No</th>
              <th className="py-3 px-4">Student & Class</th>
              <th className="py-3 px-4">Billing Term</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4">Total Amount</th>
              <th className="py-3 px-4">Remaining</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(activeTab === 'invoices' ? filteredInvoices : defaulters).map(inv => (
              <tr key={inv.id} className="hover:bg-slate-50/50">
                <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                  {inv.invoiceNo}
                </td>
                <td className="py-3.5 px-4">
                  <p className="font-bold text-slate-800">{inv.studentName}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{inv.admissionNo} • {inv.className}</p>
                </td>
                <td className="py-3.5 px-4 font-semibold text-slate-600">
                  {inv.term}
                </td>
                <td className="py-3.5 px-4 text-slate-600 font-medium">
                  {inv.dueDate}
                </td>
                <td className="py-3.5 px-4 font-bold text-slate-800">
                  ${inv.totalAmount.toFixed(2)}
                </td>
                <td className="py-3.5 px-4 font-bold text-rose-600">
                  ${inv.remainingBalance.toFixed(2)}
                </td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                    inv.status === 'Partial' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                    'bg-rose-50 text-rose-700 border border-rose-100'
                  }`}>
                    {inv.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="inline-flex items-center space-x-1.5">
                    {inv.remainingBalance > 0 && (
                      <button
                        onClick={() => {
                          setPayingInvoice(inv);
                          setPaymentAmount(inv.remainingBalance);
                          setTransactionRef('');
                        }}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs cursor-pointer"
                      >
                        Collect Fee
                      </button>
                    )}

                    {inv.status === 'Overdue' && (
                      <button
                        onClick={() => handleTriggerAiNotice(inv)}
                        title="AI-Generate Formal Parent Fee Reminder Notice"
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                    )}

                    {inv.paymentHistory.length > 0 && (
                      <button
                        onClick={() => setViewingReceipt({ invoice: inv, receipt: inv.paymentHistory[inv.paymentHistory.length - 1] })}
                        title="Print Latest Payment Receipt"
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                      >
                        <Receipt className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Collect Payment Modal */}
      {payingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">Record Fee Payment</h3>
              <button onClick={() => setPayingInvoice(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Invoice:</span>
                <span className="font-mono font-bold text-slate-800">{payingInvoice.invoiceNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Student:</span>
                <span className="font-bold text-slate-800">{payingInvoice.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Remaining Due:</span>
                <span className="font-bold text-rose-600">${payingInvoice.remainingBalance}</span>
              </div>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount to Collect ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  max={payingInvoice.remainingBalance}
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method *</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  <option value="Cash">Cash (Physical Receipt)</option>
                  <option value="Bank Transfer">Bank Transfer / Wire</option>
                  <option value="Online">Online Portal / Gateway</option>
                  <option value="Cheque">Banker's Cheque</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Transaction Ref / Cheque No.</label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={e => setTransactionRef(e.target.value)}
                  placeholder="e.g. WIRE-889921 or CHQ-4091"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPayingInvoice(null)}
                  className="px-4 py-2 text-slate-600 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayment}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingPayment ? 'Processing...' : 'Confirm & Generate Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Fee Receipt Modal (Printable) */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between no-print bg-slate-50">
              <span className="font-bold text-slate-800 text-sm">Official Institutional Fee Receipt</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button onClick={() => setViewingReceipt(null)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 print-area text-slate-800 text-xs space-y-4">
              <div className="text-center border-b border-slate-200 pb-3">
                <h3 className="text-base font-black uppercase text-indigo-950">Apex Academy of Excellence</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Official Payment Voucher</p>
                <p className="text-xs font-mono font-bold text-indigo-600 mt-1">{viewingReceipt.receipt.receiptNo}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400">Student:</span>
                  <p className="font-bold">{viewingReceipt.invoice.studentName}</p>
                </div>
                <div>
                  <span className="text-slate-400">Admission No:</span>
                  <p className="font-bold font-mono">{viewingReceipt.invoice.admissionNo}</p>
                </div>
                <div>
                  <span className="text-slate-400">Class & Section:</span>
                  <p className="font-semibold">{viewingReceipt.invoice.className} ({viewingReceipt.invoice.sectionName})</p>
                </div>
                <div>
                  <span className="text-slate-400">Payment Date:</span>
                  <p className="font-semibold">{viewingReceipt.receipt.date}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Invoice Ref:</span>
                  <span className="font-bold">{viewingReceipt.invoice.invoiceNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Channel:</span>
                  <span className="font-bold">{viewingReceipt.receipt.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction ID:</span>
                  <span className="font-mono">{viewingReceipt.receipt.transactionRef || 'CASH-STAMP'}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm">
                  <span className="font-bold text-slate-800">Amount Paid:</span>
                  <span className="font-black text-emerald-600">${viewingReceipt.receipt.amount.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 flex justify-between text-[10px] text-slate-400">
                <span>Received by: {viewingReceipt.receipt.recordedBy}</span>
                <span>Accounts Seal & Clearance</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Parent Fee Reminder Modal */}
      {aiNoticeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center gap-2 text-indigo-700">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-bold text-sm">AI Parent Fee Notice Generator</h3>
            </div>
            <p className="text-xs text-slate-500">
              Generated using Gemini AI for parent {aiNoticeStudent.parentName}
            </p>

            {generatingAiNotice ? (
              <div className="p-6 text-center text-xs text-indigo-600 font-semibold animate-pulse">
                Drafting polite reminder notification via Gemini...
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed italic">
                "{aiNoticeText}"
              </div>
            )}

            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setAiNoticeStudent(null)}
                className="px-4 py-1.5 text-slate-600 rounded-xl font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert(`Dispatched to parent mobile ${aiNoticeStudent.parentContact}: \n\n${aiNoticeText}`);
                  setAiNoticeStudent(null);
                }}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
              >
                Send via SMS / Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Invoice Modal */}
      {isNewInvoiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">Issue Institutional Invoice</h3>
              <button onClick={() => setIsNewInvoiceOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Student *</label>
                <select
                  value={invoiceStudentId}
                  onChange={e => setInvoiceStudentId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.fullName} ({s.admissionNo}) - {s.className}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Billing Term</label>
                <input
                  type="text"
                  value={invoiceTerm}
                  onChange={e => setInvoiceTerm(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={invoiceDueDate}
                  onChange={e => setInvoiceDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tuition ($)</label>
                  <input
                    type="number"
                    value={tuitionFee}
                    onChange={e => setTuitionFee(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lab ($)</label>
                  <input
                    type="number"
                    value={labFee}
                    onChange={e => setLabFee(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Activity ($)</label>
                  <input
                    type="number"
                    value={activityFee}
                    onChange={e => setActivityFee(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewInvoiceOpen(false)}
                  className="px-4 py-2 text-slate-600 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md"
                >
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
