import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { MessageSquare, MessagesSquare } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PopIn, SlideIn } from "@/components/ui/animation";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Registration form schema
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(1, "Full name is required"),
  role: z.enum(["buyer", "seller", "broker"]).default("buyer"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [verificationData, setVerificationData] = useState<{userId: number, email: string} | null>(null);
  const [resetRequestData, setResetRequestData] = useState<{userId: number, email: string} | null>(null);
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { 
    user, 
    loginMutation, 
    registerMutation, 
    verifyEmailMutation,
    resendVerificationMutation,
    forgotPasswordMutation,
    resetPasswordMutation 
  } = useAuth();
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);
  
  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      fullName: "",
      role: "buyer",
    },
  });
  
  // Login handler
  const onLogin = (data: LoginFormValues) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        toast({
          title: "Login successful",
          description: "Welcome back to Middlesman Escrow Services!",
        });
      },
      onError: (error) => {
        toast({
          title: "Login failed",
          description: error.message || "Please check your credentials and try again.",
          variant: "destructive",
        });
      }
    });
  };
  
  // Register handler
  const onRegister = (data: RegisterFormValues) => {
    registerMutation.mutate(data, {
      onSuccess: (response) => {
        // If the registration is successful, set verification data to show verification form
        if (response && response.userId) {
          setVerificationData({ userId: response.userId, email: data.email });
          setActiveTab("verify-email");
          toast({
            title: "Registration successful",
            description: "Please check your email for a verification code.",
          });
        }
      },
      onError: (error) => {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  };
  
  // Verification code form
  const verificationForm = useForm({
    resolver: zodResolver(z.object({
      code: z.string().min(6, "Verification code must be at least 6 characters")
    })),
    defaultValues: {
      code: ""
    }
  });
  
  // Handle verification submission
  const onVerify = (data: { code: string }) => {
    if (verificationData) {
      verifyEmailMutation.mutate({
        userId: verificationData.userId,
        code: data.code
      }, {
        onSuccess: (response) => {
          // Redirect to login after successful verification
          toast({
            title: "Email Verified",
            description: response.message || "Your email address has been verified. You can now log in.",
          });
          setVerificationData(null);
          setActiveTab("login");
        },
        onError: (error) => {
          toast({
            title: "Verification Failed",
            description: error.message,
            variant: "destructive",
          });
        }
      });
    }
  };
  
  // Forgot password form
  const forgotPasswordForm = useForm({
    resolver: zodResolver(z.object({
      email: z.string().email("Please enter a valid email address")
    })),
    defaultValues: {
      email: ""
    }
  });
  
  // Handle forgot password submission
  const onForgotPassword = (data: { email: string }) => {
    forgotPasswordMutation.mutate({ email: data.email }, {
      onSuccess: (response) => {
        toast({
          title: "Password Reset Code Sent",
          description: response.message || "If your email is registered, you will receive a password reset code.",
        });
        if (response && response.userId) {
          setResetRequestData({ userId: response.userId, email: data.email });
          setActiveTab("reset-password");
        }
      },
      onError: (error) => {
        toast({
          title: "Request Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  };
  
  // Reset password form
  const resetPasswordForm = useForm({
    resolver: zodResolver(z.object({
      code: z.string().min(6, "Reset code must be at least 6 characters"),
      newPassword: z.string().min(8, "Password must be at least 8 characters")
    })),
    defaultValues: {
      code: "",
      newPassword: ""
    }
  });
  
  // Handle reset password submission
  const onResetPassword = (data: { code: string, newPassword: string }) => {
    if (resetRequestData) {
      resetPasswordMutation.mutate({
        userId: resetRequestData.userId,
        code: data.code,
        newPassword: data.newPassword
      }, {
        onSuccess: (response) => {
          // Redirect to login after successful password reset
          toast({
            title: "Password Reset Successful",
            description: response.message || "Your password has been reset. You can now log in with your new password.",
          });
          setResetRequestData(null);
          setActiveTab("login");
        },
        onError: (error) => {
          toast({
            title: "Password Reset Failed",
            description: error.message,
            variant: "destructive",
          });
        }
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex w-full max-w-6xl shadow-xl rounded-xl overflow-hidden">
          {/* Left column - Forms */}
          <div className="w-full lg:w-1/2 bg-white dark:bg-gray-900 p-8">
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center">
                  <span className="material-icons text-white">security</span>
                </div>
                <span className="text-2xl font-poppins font-bold gradient-text">Middlesman</span>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
                {/* Hidden tabs that can only be accessed programmatically */}
                <TabsTrigger value="verify-email" className="hidden">Verify Email</TabsTrigger>
                <TabsTrigger value="forgot-password" className="hidden">Forgot Password</TabsTrigger>
                <TabsTrigger value="reset-password" className="hidden">Reset Password</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <PopIn>
                  <Card>
                    <CardHeader>
                      <CardTitle>Login to your account</CardTitle>
                      <CardDescription>
                        Enter your credentials to access your account
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...loginForm}>
                        <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                          <FormField
                            control={loginForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your username" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={loginForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="Enter your password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="space-y-4">
                            <Button 
                              type="submit" 
                              className="w-full btn-primary"
                              disabled={loginMutation.isPending}
                            >
                              {loginMutation.isPending ? (
                                <span className="flex items-center justify-center">
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Logging in...
                                </span>
                              ) : (
                                "Sign in"
                              )}
                            </Button>
                            
                            <div className="text-center">
                              <Button 
                                type="button" 
                                variant="link" 
                                className="text-sm text-primary-dark dark:text-blue-400"
                                onClick={() => setActiveTab("forgot-password")}
                              >
                                Forgot your password?
                              </Button>
                            </div>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Don't have an account?{" "}
                        <Button 
                          variant="link" 
                          className="p-0 text-primary-dark dark:text-blue-400"
                          onClick={() => setActiveTab("register")}
                        >
                          Register now
                        </Button>
                      </p>
                    </CardFooter>
                  </Card>
                </PopIn>
              </TabsContent>
              
              <TabsContent value="register">
                <PopIn>
                  <Card>
                    <CardHeader>
                      <CardTitle>Create an account</CardTitle>
                      <CardDescription>
                        Get started with Middlesman escrow services
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...registerForm}>
                        <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                          <FormField
                            control={registerForm.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your full name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={registerForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input placeholder="Choose a username" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={registerForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                  <Input
                                    type="email"
                                    placeholder="Enter your email address"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={registerForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="Create a password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={registerForm.control}
                            name="role"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>I am a</FormLabel>
                                <div className="grid grid-cols-3 gap-2">
                                  <Button
                                    type="button"
                                    variant={field.value === "buyer" ? "default" : "outline"}
                                    className={field.value === "buyer" ? "btn-primary" : ""}
                                    onClick={() => registerForm.setValue("role", "buyer")}
                                  >
                                    Buyer
                                  </Button>
                                  <Button
                                    type="button"
                                    variant={field.value === "seller" ? "default" : "outline"}
                                    className={field.value === "seller" ? "btn-primary" : ""}
                                    onClick={() => registerForm.setValue("role", "seller")}
                                  >
                                    Seller
                                  </Button>
                                  <Button
                                    type="button"
                                    variant={field.value === "broker" ? "default" : "outline"}
                                    className={field.value === "broker" ? "btn-primary" : ""}
                                    onClick={() => registerForm.setValue("role", "broker")}
                                  >
                                    Broker
                                  </Button>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          

                          
                          <Button 
                            type="submit" 
                            className="w-full btn-primary"
                            disabled={registerMutation.isPending}
                          >
                            {registerMutation.isPending ? (
                              <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating account...
                              </span>
                            ) : (
                              "Create account"
                            )}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Already have an account?{" "}
                        <Button 
                          variant="link" 
                          className="p-0 text-primary-dark dark:text-blue-400"
                          onClick={() => setActiveTab("login")}
                        >
                          Sign in
                        </Button>
                      </p>
                    </CardFooter>
                  </Card>
                </PopIn>
              </TabsContent>
              
              {/* Email Verification Tab */}
              <TabsContent value="verify-email">
                <PopIn>
                  <Card>
                    <CardHeader>
                      <CardTitle>Verify Your Email Address</CardTitle>
                      <CardDescription>
                        {verificationData && (
                          <>
                            We've sent a verification code to <span className="font-medium">{verificationData.email}</span>.
                            Please check your email inbox for a message from <span className="font-medium">MM ESCROW</span>.
                          </>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...verificationForm}>
                        <form onSubmit={verificationForm.handleSubmit(onVerify)} className="space-y-4">
                          <FormField
                            control={verificationForm.control}
                            name="code"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Verification Code</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter verification code" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            className="w-full btn-primary"
                            disabled={verifyEmailMutation.isPending}
                          >
                            {verifyEmailMutation.isPending ? (
                              <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Verifying...
                              </span>
                            ) : (
                              "Verify Email Address"
                            )}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Didn't receive the code?{" "}
                        <Button 
                          variant="link" 
                          className="p-0 text-primary-dark dark:text-blue-400"
                          onClick={() => {
                            if (verificationData) {
                              // Resend the verification code using the new endpoint
                              resendVerificationMutation.mutate({ userId: verificationData.userId });
                            }
                          }}
                        >
                          Resend code
                        </Button>
                      </p>
                    </CardFooter>
                  </Card>
                </PopIn>
              </TabsContent>
              
              {/* Forgot Password Tab */}
              <TabsContent value="forgot-password">
                <PopIn>
                  <Card>
                    <CardHeader>
                      <CardTitle>Reset Your Password</CardTitle>
                      <CardDescription>
                        Enter your email address and we'll send you a password reset code
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...forgotPasswordForm}>
                        <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPassword)} className="space-y-4">
                          <FormField
                            control={forgotPasswordForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                  <Input
                                    type="email"
                                    placeholder="Enter your email address"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            className="w-full btn-primary"
                            disabled={forgotPasswordMutation.isPending}
                          >
                            {forgotPasswordMutation.isPending ? (
                              <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Submitting...
                              </span>
                            ) : (
                              "Send Reset Instructions"
                            )}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Remembered your password?{" "}
                        <Button 
                          variant="link" 
                          className="p-0 text-primary-dark dark:text-blue-400"
                          onClick={() => setActiveTab("login")}
                        >
                          Back to login
                        </Button>
                      </p>
                    </CardFooter>
                  </Card>
                </PopIn>
              </TabsContent>
              
              {/* Reset Password Tab */}
              <TabsContent value="reset-password">
                <PopIn>
                  <Card>
                    <CardHeader>
                      <CardTitle>Set New Password</CardTitle>
                      <CardDescription>
                        {resetRequestData && (
                          <>
                            Enter the reset code sent to <span className="font-medium">{resetRequestData.email}</span> and your new password.
                            Check your email inbox for a message from <span className="font-medium">MM ESCROW</span>.
                          </>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...resetPasswordForm}>
                        <form onSubmit={resetPasswordForm.handleSubmit(onResetPassword)} className="space-y-4">
                          <FormField
                            control={resetPasswordForm.control}
                            name="code"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Reset Code</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter reset code from email" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={resetPasswordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="password" 
                                    placeholder="Create a new password" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            className="w-full btn-primary"
                            disabled={resetPasswordMutation.isPending}
                          >
                            {resetPasswordMutation.isPending ? (
                              <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Resetting...
                              </span>
                            ) : (
                              "Reset Password"
                            )}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Didn't receive the code?{" "}
                        <Button 
                          variant="link" 
                          className="p-0 text-primary-dark dark:text-blue-400"
                          onClick={() => {
                            if (resetRequestData) {
                              forgotPasswordForm.setValue("email", resetRequestData.email);
                              setActiveTab("forgot-password");
                            }
                          }}
                        >
                          Request new code
                        </Button>
                      </p>
                    </CardFooter>
                  </Card>
                </PopIn>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right column - Hero content */}
          <div className="hidden lg:block lg:w-1/2 gradient-bg p-12">
            <SlideIn direction="right">
              <div className="h-full flex flex-col justify-center text-white">
                <h1 className="text-4xl font-bold mb-6">Secure Transactions, Guaranteed Results</h1>
                <p className="text-lg mb-8">Middlesman provides a secure platform for online transactions, ensuring your funds are protected until all conditions are met.</p>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-3">
                    <div className="rounded-full bg-white/20 p-2 backdrop-blur-sm">
                      <span className="material-icons">verified_user</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1">Safe Escrow Service</h3>
                      <p className="text-white/80">Your payment is held securely until you're satisfied with the received goods or services.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="rounded-full bg-white/20 p-2 backdrop-blur-sm">
                      <span className="material-icons">speed</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1">Efficient Process</h3>
                      <p className="text-white/80">Fast and straightforward transaction flow with clear milestones and payment tracking.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="rounded-full bg-white/20 p-2 backdrop-blur-sm">
                      <span className="material-icons">support_agent</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1">Dispute Resolution</h3>
                      <p className="text-white/80">Professional mediation available if any issues arise during the transaction process.</p>
                    </div>
                  </div>
                </div>
              </div>
            </SlideIn>
          </div>
        </div>
      </div>
    </div>
  );
}
