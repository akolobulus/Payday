import { useState } from "react";
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Plus, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";

interface WalletTopUpProps {
  trigger?: React.ReactNode;
}

export function WalletTopUp({ trigger }: WalletTopUpProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const { toast } = useToast();

  const { data: user } = useQuery<User>({
    queryKey: ['/api/user/profile']
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: (data: { transaction_id: number; tx_ref: string; amount: number }) => 
      apiRequest('/api/flutterwave/verify-payment', 'POST', data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      setIsOpen(false);
      setAmount("");
      toast({
        title: "🎉 Wallet Topped Up!",
        description: `₦${((data.amount || 0) / 100).toLocaleString()} added to your wallet successfully. Ready for same-day gigs!`,
        duration: 5000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Payment Verification Failed",
        description: error.message || "Unable to verify payment. Contact support if debited.",
        variant: "destructive",
      });
    }
  });

  const config = {
    public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || "FLWPUBK_TEST-demo-key",
    tx_ref: `payday_topup_${Date.now()}`,
    amount: parseInt(amount) || 0,
    currency: 'NGN',
    payment_options: 'card,mobilemoney,ussd,banktransfer',
    customer: {
      email: user?.email || 'demo@payday.ng',
      phone_number: user?.phone || '08123456789',
      name: `${user?.firstName || 'Demo'} ${user?.lastName || 'User'}`,
    },
    customizations: {
      title: 'Payday Wallet Top-up',
      description: 'Add money to your Payday wallet for instant gig payments',
      logo: window.location.origin + '/src/assets/20250819_104458-removebg-preview_1755623157202.png',
    },
    meta: {
      user_id: user?.id || 'demo-user',
      purpose: 'wallet_topup'
    }
  };

  const handleFlutterPayment = useFlutterwave(config);

  const initiatePayment = () => {
    const amountValue = parseInt(amount);
    if (!amountValue || amountValue < 100) {
      toast({
        title: "Invalid Amount",
        description: "Minimum top-up amount is ₦100",
        variant: "destructive",
      });
      return;
    }

    handleFlutterPayment({
      callback: (response) => {
        console.log('Flutterwave Response:', response);
        if (response.status === 'successful') {
          verifyPaymentMutation.mutate({
            transaction_id: response.transaction_id,
            tx_ref: response.tx_ref,
            amount: amountValue * 100 // Convert to kobo
          });
        } else {
          toast({
            title: "Payment Failed",
            description: "Payment was not completed. Please try again.",
            variant: "destructive",
          });
        }
        closePaymentModal();
      },
      onClose: () => {
        console.log('Payment modal closed');
      },
    });
  };

  const quickAmounts = [500, 1000, 2000, 5000, 10000];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-green-600 hover:bg-green-700" data-testid="button-topup-wallet">
            <Plus className="h-4 w-4 mr-2" />
            Top Up Wallet
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-green-600" />
            Top Up Your Payday Wallet
          </DialogTitle>
          <DialogDescription>
            Add money to your wallet for instant same-day gig payments. Funds are available immediately.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Same-day Payment Highlight */}
          <Card className="border-2 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-yellow-600" />
                <span className="font-semibold text-yellow-800 dark:text-yellow-200">Same-Day Payment Ready</span>
              </div>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                With funded wallet, you can post gigs and pay workers instantly upon completion. No waiting, no delays!
              </p>
            </CardContent>
          </Card>

          {/* Quick Amount Selection */}
          <div>
            <Label className="text-sm font-medium">Quick Select Amount</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {quickAmounts.map((quickAmount) => (
                <Button
                  key={quickAmount}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(quickAmount.toString())}
                  className={amount === quickAmount.toString() ? "bg-green-50 border-green-300" : ""}
                  data-testid={`quick-amount-${quickAmount}`}
                >
                  ₦{quickAmount.toLocaleString()}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Amount Input */}
          <div>
            <Label htmlFor="amount" className="text-sm font-medium">
              Custom Amount (₦)
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount (min ₦100)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="100"
              className="mt-1"
              data-testid="input-topup-amount"
            />
          </div>

          {/* Payment Methods */}
          <div className="grid grid-cols-2 gap-2">
            <Badge variant="outline" className="justify-center py-2">
              💳 Cards
            </Badge>
            <Badge variant="outline" className="justify-center py-2">
              📱 Mobile Money
            </Badge>
            <Badge variant="outline" className="justify-center py-2">
              🏦 Bank Transfer
            </Badge>
            <Badge variant="outline" className="justify-center py-2">
              *123# USSD
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
              data-testid="button-cancel-topup"
            >
              Cancel
            </Button>
            <Button
              onClick={initiatePayment}
              disabled={!amount || parseInt(amount) < 100 || verifyPaymentMutation.isPending}
              className="flex-1 bg-green-600 hover:bg-green-700"
              data-testid="button-proceed-payment"
            >
              {verifyPaymentMutation.isPending ? "Processing..." : `Pay ₦${amount ? parseInt(amount).toLocaleString() : "0"}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}