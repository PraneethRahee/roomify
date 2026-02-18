interface AuthState {
    isSignedIn:boolean;
    username:string | null;
    userId:string | null;
}

type AuthContext ={
    isSignedIn:boolean;
    username:string | null;
    userId:string | null;
    refreshAuth:()=>Promise<boolean>;
    signOut:()=>Promise<boolean>;
    signIn:()=>Promise<boolean>;
}