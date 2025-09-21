import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Wallet, CreditCard, Smartphone, Bank, Plus, ArrowUpRight, ArrowDownLeft, Check, X, Clock, Shield } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { addPaymentMethodSchema } from "@shared/schema";
import type { Wallet as WalletType, PaymentMethod, Transaction, EscrowTransaction } from "@shared/schema";
import { z } from "zod";

// Utility function for formatting Naira currency
export const formatNaira = (amountInKobo: number): string => {
  const amountInNaira = amountInKobo / 100;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
  }).format(amountInNaira);
};

// Wallet Balance Card
export function WalletBalance() {
  const { toast } = useToast();
  
  const { data: wallet, isLoading } = useQuery<WalletType>({
    queryKey: ['/api/wallet']
  });

  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ['/api/wallet/transactions']
  });

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </CardHeader>
      </Card>
    );
  }

  if (!wallet) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Not Found
          </CardTitle>
          <CardDescription>Unable to load wallet information</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card data-testid="wallet-balance">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-green-600" />
          Your Wallet
        </CardTitle>
        <CardDescription>Available balance and earnings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-muted-foreground">Available Balance</p>
            <p className="text-2xl font-bold text-green-600" data-testid="available-balance">
              {formatNaira(wallet.balance)}
            </p>
          </div>
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-sm text-muted-foreground">Pending (Escrow)</p>
            <p className="text-2xl font-bold text-yellow-600" data-testid="pending-balance">
              {formatNaira(wallet.pendingBalance)}
            </p>
          </div>
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-muted-foreground">Total Earnings</p>
            <p className="text-2xl font-bold text-blue-600" data-testid="total-earnings">
              {formatNaira(wallet.totalEarnings)}
            </p>
          </div>
        </div>
        
        {transactions && transactions.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Recent Transactions</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between text-sm p-2 border rounded">
                  <div className="flex items-center gap-2">
                    {transaction.amount > 0 ? (
                      <ArrowDownLeft className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-red-600" />
                    )}
                    <span className="truncate max-w-40">{transaction.description}</span>
                  </div>
                  <span className={`font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.amount > 0 ? '+' : ''}{formatNaira(Math.abs(transaction.amount))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Payment Method Setup Component
export function PaymentMethodSetup() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const { data: paymentMethods, refetch } = useQuery<PaymentMethod[]>({
    queryKey: ['/api/payment-methods']
  });

  const { data: providers } = useQuery<any[]>({
    queryKey: ['/api/payment-providers']
  });

  const form = useForm<z.infer<typeof addPaymentMethodSchema>>({
    resolver: zodResolver(addPaymentMethodSchema),
    defaultValues: {
      type: "mobile_money",
      provider: "",
      accountNumber: "",
      accountName: "",
      bankCode: "",
      phoneNumber: "",
      isDefault: false,
    },
  });

  const addPaymentMethodMutation = useMutation({
    mutationFn: (data: z.infer<typeof addPaymentMethodSchema>) => 
      apiRequest('/api/payment-methods', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment-methods'] });
      setIsOpen(false);
      form.reset();
      toast({
        title: "Payment method added",
        description: "Your payment method has been added successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add payment method",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  });

  const deletePaymentMethodMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/payment-methods/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment-methods'] });
      toast({
        title: "Payment method removed",
        description: "Payment method has been removed successfully.",
      });
    }
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/payment-methods/${id}/set-default`, 'POST'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment-methods'] });
      toast({
        title: "Default payment method updated",
        description: "Your default payment method has been updated.",
      });
    }
  });

  const onSubmit = (data: z.infer<typeof addPaymentMethodSchema>) => {
    addPaymentMethodMutation.mutate(data);
  };

  const watchedType = form.watch("type");
  const popularProviders = providers?.filter(p => p.popular) || [];
  const filteredProviders = providers?.filter(p => p.type === watchedType) || [];

  return (
    <Card data-testid="payment-methods">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Methods
          </span>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-add-payment-method">
                <Plus className="h-4 w-4 mr-2" />
                Add Method
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Payment Method</DialogTitle>
                <DialogDescription>
                  Add a new payment method for withdrawals
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-payment-type">
                              <SelectValue placeholder="Select payment type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="mobile_money">Mobile Money</SelectItem>
                            <SelectItem value="bank_account">Bank Account</SelectItem>
                            <SelectItem value="card">Debit Card</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="provider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provider</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-provider">
                              <SelectValue placeholder="Select provider" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredProviders.map((provider) => (
                              <SelectItem key={provider.id} value={provider.id}>
                                {provider.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchedType === "mobile_money" && (
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="+234 XXX XXX XXXX" 
                              {...field} 
                              data-testid="input-phone-number"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {watchedType === "bank_account" && (
                    <>
                      <FormField
                        control={form.control}
                        name="accountNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Number</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="XXXXXXXXXX" 
                                {...field} 
                                data-testid="input-account-number"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="accountName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="John Doe" 
                                {...field} 
                                data-testid="input-account-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsOpen(false)}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={addPaymentMethodMutation.isPending}
                      data-testid="button-save-payment-method"
                    >
                      {addPaymentMethodMutation.isPending ? "Adding..." : "Add Method"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!paymentMethods?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No payment methods added yet</p>
            <p className="text-sm">Add a payment method to withdraw your earnings</p>
          </div>
        ) : (
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div 
                key={method.id} 
                className="flex items-center justify-between p-3 border rounded-lg"
                data-testid={`payment-method-${method.id}`}
              >
                <div className="flex items-center gap-3">
                  {method.type === 'mobile_money' && <Smartphone className="h-5 w-5 text-blue-600" />}
                  {method.type === 'bank_account' && <Bank className="h-5 w-5 text-green-600" />}
                  {method.type === 'card' && <CreditCard className="h-5 w-5 text-purple-600" />}
                  <div>
                    <p className="font-medium">{providers?.find(p => p.id === method.provider)?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {method.phoneNumber || method.accountNumber}
                    </p>
                  </div>
                  {method.isDefault && (
                    <Badge variant="secondary" className="ml-2">Default</Badge>
                  )}
                  {method.isVerified && (
                    <Check className="h-4 w-4 text-green-600 ml-2" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!method.isDefault && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDefaultMutation.mutate(method.id)}
                      disabled={setDefaultMutation.isPending}
                      data-testid={`button-set-default-${method.id}`}
                    >
                      Set Default
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive" data-testid={`button-delete-${method.id}`}>
                        <X className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Payment Method</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove this payment method? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deletePaymentMethodMutation.mutate(method.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Withdrawal Dialog Component
export function WithdrawalDialog({ trigger }: { trigger: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const { toast } = useToast();

  const { data: wallet } = useQuery<WalletType>({
    queryKey: ['/api/wallet']
  });

  const { data: paymentMethods } = useQuery<PaymentMethod[]>({
    queryKey: ['/api/payment-methods']
  });

  const withdrawMutation = useMutation({
    mutationFn: (data: { amount: number; paymentMethodId: string }) =>
      apiRequest('/api/withdraw', 'POST', data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      setIsOpen(false);
      setAmount("");
      setSelectedPaymentMethod("");
      toast({
        title: "Withdrawal initiated",
        description: `Withdrawal of ${formatNaira(parseFloat(amount) * 100)} has been initiated. Reference: ${data.reference}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Withdrawal failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  });

  const handleWithdraw = () => {
    if (!amount || !selectedPaymentMethod) {
      toast({
        title: "Missing information",
        description: "Please enter amount and select payment method",
        variant: "destructive",
      });
      return;
    }

    const amountInKobo = parseFloat(amount) * 100;
    if (amountInKobo < 10000) { // ₦100 minimum
      toast({
        title: "Minimum withdrawal",
        description: "Minimum withdrawal amount is ₦100",
        variant: "destructive",
      });
      return;
    }

    withdrawMutation.mutate({
      amount: amountInKobo,
      paymentMethodId: selectedPaymentMethod
    });
  };

  const availableBalance = wallet ? wallet.balance / 100 : 0;
  const verifiedMethods = paymentMethods?.filter(method => method.isVerified) || [];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
          <DialogDescription>
            Withdraw your available balance to your payment method
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount (₦)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="100"
              max={availableBalance}
              data-testid="input-withdrawal-amount"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Available: {formatNaira(wallet?.balance || 0)} • Minimum: ₦100
            </p>
          </div>

          <div>
            <Label htmlFor="payment-method">Payment Method</Label>
            <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
              <SelectTrigger data-testid="select-withdrawal-method">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {verifiedMethods.map((method) => (
                  <SelectItem key={method.id} value={method.id}>
                    {method.provider} - {method.phoneNumber || method.accountNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {verifiedMethods.length === 0 && (
              <p className="text-xs text-red-600 mt-1">
                No verified payment methods available. Please add and verify a payment method first.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)} data-testid="button-cancel-withdrawal">
              Cancel
            </Button>
            <Button 
              onClick={handleWithdraw}
              disabled={withdrawMutation.isPending || !verifiedMethods.length}
              data-testid="button-confirm-withdrawal"
            >
              {withdrawMutation.isPending ? "Processing..." : "Withdraw"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Escrow Status Component for Gigs
export function EscrowStatus({ gigId }: { gigId: string }) {
  const { data: escrow } = useQuery<EscrowTransaction>({
    queryKey: ['/api/escrow/gig', gigId]
  });

  if (!escrow) {
    return (
      <Badge variant="outline" className="text-red-600">
        <X className="h-3 w-3 mr-1" />
        Not Funded
      </Badge>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'escrowed': return 'text-green-600';
      case 'released': return 'text-blue-600';
      case 'refunded': return 'text-gray-600';
      case 'disputed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-3 w-3 mr-1" />;
      case 'escrowed': return <Shield className="h-3 w-3 mr-1" />;
      case 'released': return <Check className="h-3 w-3 mr-1" />;
      case 'refunded': return <ArrowUpRight className="h-3 w-3 mr-1" />;
      case 'disputed': return <X className="h-3 w-3 mr-1" />;
      default: return <Clock className="h-3 w-3 mr-1" />;
    }
  };

  const statusDisplay = escrow.status.charAt(0).toUpperCase() + escrow.status.slice(1);

  return (
    <div className="space-y-2" data-testid={`escrow-status-${gigId}`}>
      <Badge variant="outline" className={getStatusColor(escrow.status)}>
        {getStatusIcon(escrow.status)}
        {statusDisplay}
      </Badge>
      <div className="text-sm text-muted-foreground">
        <p>Amount: {formatNaira(escrow.amount)}</p>
        <p>Platform Fee: {formatNaira(escrow.platformFee)}</p>
        <p>Total: {formatNaira(escrow.amount + escrow.platformFee)}</p>
      </div>
    </div>
  );
}

// Fund Escrow Dialog for Gig Posters
export function FundEscrowDialog({ gigId, trigger }: { gigId: string; trigger: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const { data: wallet } = useQuery<WalletType>({
    queryKey: ['/api/wallet']
  });

  const fundEscrowMutation = useMutation({
    mutationFn: () => apiRequest('/api/escrow/fund-gig', 'POST', { gigId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gigs/posted'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      setIsOpen(false);
      toast({
        title: "Escrow funded successfully",
        description: "Your gig is now ready for applications with secured payment!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Funding failed",
        description: error.message || "Unable to fund escrow",
        variant: "destructive",
      });
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Fund Escrow</DialogTitle>
          <DialogDescription>
            Secure your gig payment in escrow to attract quality applications
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100">How Escrow Works:</h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 mt-2 space-y-1">
              <li>• Payment is held securely until gig completion</li>
              <li>• Released instantly when both parties confirm completion</li>
              <li>• Full refund if gig is cancelled</li>
              <li>• 12% platform fee included</li>
            </ul>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Available Balance</p>
            <p className="text-2xl font-bold">{formatNaira(wallet?.balance || 0)}</p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)} data-testid="button-cancel-fund">
              Cancel
            </Button>
            <Button 
              onClick={() => fundEscrowMutation.mutate()}
              disabled={fundEscrowMutation.isPending}
              data-testid="button-confirm-fund"
            >
              {fundEscrowMutation.isPending ? "Funding..." : "Fund Escrow"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}