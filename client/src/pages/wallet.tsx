import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WalletTopUp } from "@/components/ui/wallet-topup";
import { WithdrawalDialog } from "@/components/ui/payment-components";
import { formatNaira } from "@/components/ui/payment-components";
import ZeroBrokeMode from "@/components/ui/zero-broke-mode";
import SavingsVault from "@/components/ui/savings-vault";
import BudgetTracker from "@/components/ui/budget-tracker";
import DashboardSidebar from "@/components/navigation/dashboard-sidebar";
import DashboardHeader from "@/components/navigation/dashboard-sidebar";
import { Wallet, Eye, EyeOff, Search, Shield, CreditCard } from "lucide-react";
import type { User, Wallet as WalletType, Transaction } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState("wallet");
  const [showBalance, setShowBalance] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: user } = useQuery<User>({
    queryKey: ['/api/user/profile']
  });

  const { data: wallet, isLoading: walletLoading } = useQuery<WalletType>({
    queryKey: ['/api/wallet']
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/wallet/transactions']
  });

  const getUserInitials = () => {
    if (!user?.firstName && !user?.lastName) return "U";
    return `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();
  };

  const handleWalletClick = () => {
    setActiveTab('wallet');
  };

  const handleProfileClick = () => {
    setActiveTab('profile');
  };

  const handleNotificationsClick = () => {
    toast({
      title: "Notifications",
      description: "No new notifications",
    });
  };

  const filteredTransactions = transactions?.filter(transaction =>
    transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.type.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeDisplay = (type: string) => {
    switch (type) {
      case 'topup':
        return 'Top Up';
      case 'withdrawal':
        return 'Withdrawal';
      case 'escrow_hold':
        return 'Escrow Hold';
      case 'escrow_release':
        return 'Escrow Release';
      case 'payment':
        return 'Payment';
      case 'refund':
        return 'Refund';
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} userType={user?.userType || 'seeker'} />
      
      <div className="flex-1 lg:ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2" data-testid="wallet-title">
              Wallet
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage, fund and monitor your wallet with ease
            </p>
          </div>

          {/* Wallet Balance Card */}
          <Card className="mb-8 bg-gradient-to-br from-blue-500 to-blue-600 border-none shadow-lg overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Wallet className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-white font-medium">NGN Wallet</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-white hover:bg-white/20"
                  data-testid="button-toggle-balance"
                >
                  {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-5xl font-bold text-white mb-6" data-testid="wallet-balance-display">
                    {showBalance ? formatNaira(wallet?.balance || 0) : '₦••••••'}
                  </p>
                  <WithdrawalDialog 
                    trigger={
                      <Button 
                        variant="secondary" 
                        className="bg-white text-blue-600 hover:bg-gray-100"
                        data-testid="button-withdraw-funds"
                      >
                        Withdraw Funds
                      </Button>
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fund Wallet Section */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Fund your wallet with credit card, debit card, or bank transfer
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Shield className="h-4 w-4 text-green-600" />
                      <Badge variant="secondary" className="text-xs">
                        Secure
                      </Badge>
                    </div>
                  </div>
                </div>
                <WalletTopUp 
                  trigger={
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      data-testid="button-fund-wallet"
                    >
                      Fund Wallet
                    </Button>
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Transaction History
                </h2>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                    data-testid="input-search-transactions"
                  />
                </div>
              </div>

              {transactionsLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  ))}
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                    <Wallet className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchQuery ? "No transactions found" : "No transactions yet"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Transaction</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id} data-testid={`transaction-row-${transaction.id}`}>
                          <TableCell className="font-mono text-xs">
                            {transaction.id.slice(0, 8)}...
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {transaction.description}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getTypeDisplay(transaction.type)}
                            </Badge>
                          </TableCell>
                          <TableCell className={`font-semibold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.amount >= 0 ? '+' : ''}{formatNaira(Math.abs(transaction.amount))}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(transaction.status)}>
                              {transaction.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {new Date(transaction.createdAt!).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" data-testid={`button-view-${transaction.id}`}>
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Features */}
          <div className="space-y-8">
            <ZeroBrokeMode />
            <SavingsVault />
            <BudgetTracker />
          </div>
        </div>
      </div>
    </div>
  );
}
