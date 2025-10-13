import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { DollarSign, Shield, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { User, Microloan } from "@shared/schema";

interface ZeroBrokeModeProps {
  user: User;
}

export default function ZeroBrokeMode({ user }: ZeroBrokeModeProps) {
  const { toast } = useToast();
  const [loanAmount, setLoanAmount] = useState("");

  const { data: activeLoans = [] } = useQuery<Microloan[]>({
    queryKey: ['/api/microloans', user.id],
  });

  const requestLoanMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/microloans/request", {
        userId: user.id,
        loanAmount: Math.round(parseFloat(loanAmount) * 100),
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/microloans', user.id] });
      toast({
        title: "Loan Approved!",
        description: "Funds have been added to your wallet.",
      });
      setLoanAmount("");
    },
    onError: (error: any) => {
      toast({
        title: "Loan Request Failed",
        description: error.message || "You need a higher trust score to access loans.",
        variant: "destructive",
      });
    },
  });

  const repayLoanMutation = useMutation({
    mutationFn: async (loanId: string) => {
      const response = await apiRequest("POST", "/api/microloans/repay", {
        loanId,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/microloans', user.id] });
      toast({
        title: "Loan Repaid",
        description: "Your loan has been fully repaid.",
      });
    },
  });

  const trustScoreRequirement = 500;
  const maxLoanAmount = Math.min(user.trustScore * 10, 50000);
  const canAccessLoans = user.trustScore >= trustScoreRequirement;
  const hasActiveLoan = activeLoans.some(loan => loan.status === 'active');

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-payday-blue" />
          Zero Broke Mode
        </CardTitle>
        <CardDescription>
          Emergency cash advances for trusted workers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center py-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Your Trust Score</p>
          <p className="text-4xl font-bold text-payday-blue">{user.trustScore}</p>
          {canAccessLoans ? (
            <p className="text-sm text-green-600 mt-2 font-medium">
              ✓ Eligible for microloans up to ₦{(maxLoanAmount / 100).toFixed(2)}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mt-2">
              Complete {Math.ceil((trustScoreRequirement - user.trustScore) / 100)} more gigs to unlock loans
            </p>
          )}
        </div>

        {!canAccessLoans && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Build your trust score to {trustScoreRequirement} by completing verified gigs to access Zero Broke Mode loans.
            </AlertDescription>
          </Alert>
        )}

        {canAccessLoans && !hasActiveLoan && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Request Loan Amount (₦)
              </label>
              <Input
                data-testid="input-loan-amount"
                type="number"
                placeholder="Enter amount"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                max={maxLoanAmount / 100}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum: ₦{(maxLoanAmount / 100).toFixed(2)} • 0% interest
              </p>
            </div>
            <Button
              data-testid="button-request-loan"
              onClick={() => requestLoanMutation.mutate()}
              className="w-full"
              disabled={requestLoanMutation.isPending || !loanAmount || parseFloat(loanAmount) > maxLoanAmount / 100}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Request Loan
            </Button>
          </div>
        )}

        {activeLoans.filter(loan => loan.status === 'active').map((loan) => (
          <div key={loan.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">Active Loan</p>
                <p className="text-2xl font-bold text-payday-blue">
                  ₦{(loan.loanAmount / 100).toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Repaid</p>
                <p className="text-sm font-medium">
                  ₦{(loan.repaidAmount / 100).toFixed(2)}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Due: {new Date(loan.dueDate).toLocaleDateString()}
              </p>
            </div>
            <Button
              data-testid="button-repay-loan"
              onClick={() => repayLoanMutation.mutate(loan.id)}
              variant="outline"
              className="w-full"
              disabled={repayLoanMutation.isPending}
            >
              Repay Loan
            </Button>
          </div>
        ))}

        <div className="text-sm text-muted-foreground space-y-2">
          <p className="font-medium">How it works:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Build trust score by completing gigs</li>
            <li>Access 0% interest microloans</li>
            <li>Loan automatically deducted from next gig payment</li>
            <li>Higher trust score = larger loan amounts</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
