import { Component, OnInit } from '@angular/core';
import { AuthService } from '../Shared/auth.service';
import { DataService } from '../Shared/data.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { LoadingController, NavController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.page.html',
  styleUrls: ['./log-in.page.scss'],
})
export class LogInPage implements OnInit {

 

     email:string='';
     password: string = '';
     showPassword: boolean = false;




  constructor( private navCtrl:NavController,
    private toast:ToastController, 
     private load :LoadingController,
     private fauth: AngularFireAuth, 
     private dataService: DataService
      ) { }

  passwordRegex ="/^(?=.\d)(?=.[a-z])(?=.[A-Z])(?=.[^a-zA-Z0-9])(?!.*\s).{8,12}$/";

  ngOnInit() {
 
  }
 visibility()
 {
  this.showPassword = ! this.showPassword;
}



validation()
{
  if(!this.email&&!this.password)
  {
    this.showToast("Please fill all the fields")
    return false;
  }
  if(!this.password)
  {
    this.showToastErro("Please enter password")
    return false;
  }

  if(!this.email)
  {
    this.showToastErro("Please enter email")
    return false;
  }
  return true;
}

showToastErro(message:string){
  this.toast.create(
    {message:message,
    duration:2000,
    position: "bottom",
    color: 'danger'
  }).then(toastData => toastData.present());
}


async Login() {
  if (this.validation()) {
    const loader = await this.load.create({
      message: 'Please wait...'
    });
    await loader.present();
  
    try {
      const userExist = await this.fauth.fetchSignInMethodsForEmail(this.email);
      if(userExist.length === 0){
        this.showToast('User does not exist or email is not verified');
     }else{
      const { user } = await this.fauth.signInWithEmailAndPassword(this.email, this.password);
     
      if (user) {
        if (user.emailVerified) {
          const userId = user.uid;
       
          localStorage.setItem('userId', userId);
          localStorage.setItem('password', this.password);
          this.password ="";this.email="";
          this.navCtrl.navigateForward('home');
        } else {
          this.showToast('Email not verified. Please check your email and verify your account.');
        }
      } else {
        this.showToast('Invalid username or password');
      }
    }
    } catch (error) {
     // console.error('Error logging in:', error);
      this.showToast('Invalid username or password');
    }
  

    await loader.dismiss();
  }
}




showToast(message:string){
  this.toast.create(
    {message:message,
    duration: 2000,
    position: "bottom",
    color: 'danger'
  }).then(toastData => toastData.present());
}


}

