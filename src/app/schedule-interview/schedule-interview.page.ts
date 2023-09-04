import { Component } from '@angular/core';
import { ToastController, NavController, AlertController, LoadingController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
//import{EmailComposer} from '@ionic-native/email-composer/ngx';
//import { EmailComposerOptions } from '@ionic-native/email-composer';
//import { IonicNativePlugin } from '@ionic-native/core';

@Component({
  selector: 'app-schedule-interview',
  templateUrl: './schedule-interview.page.html',
  styleUrls: ['./schedule-interview.page.scss'],
})
export class ScheduleInterviewPage {

  // Initialize properties with default values
  int_id:any;
  name:any;
  surname:any;
  email: any;
  date:any;
  status='Waiting';
  emailError:any;
  emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; 
  toast: any;
  

    
  constructor( private db: AngularFirestore,private router:Router,private toastController: ToastController,
    private alertController: AlertController,private loadingController: LoadingController,
     public navCtrl: NavController, private auth: AngularFireAuth) {}
 
  async submit() {
  
    const subject = 'Scheduled Interview';
    const body = `
      Name: ${this.name}
      Surname: ${this.surname}
      Email: ${this.email}
      Date:${this.date}
    `;

    // const email = {
    //   to: this.email, // Add recipient's email here
    //   subject: subject,
    //   body: body,
    //   isHtml: true
    // };

    // // Send the email
    // this.emailComposer.open(email)
    // .then(() => {
    //   // Email opened successfully
    //   console.log('Email opened successfully');
    // })
    // .catch(error => {
    //   // Error opening email
    //   console.error('Error opening email', error);
    // });

  
    if (!this.emailRegex.test(this.email)) {
      const toast = await this.toastController.create({
        message: "Please enter a valid email address.",
        duration: 2000,
        position: 'top'
      });
      return;
    }
    
      
    if (this.int_id.toString().length< 13) {
      const toast = await this.toastController.create({
        message: 'ID must not be less than 13 digits long',
        duration: 2000,
        position: 'top',
        color: 'danger'
      });
      toast.present();
      return;
    }
    
    if (this.int_id.toString().length > 13) {
      const toast = await this.toastController.create({
        message: 'ID must not be greater than 13 digits long',
        duration: 2000,
        position: 'top',
        color: 'danger'
      });
      toast.present();
      return;
    }


    if(!isNaN(this.int_id)){
    
    }else{
      const toast = await this.toastController.create({
        message: 'ID must be 13 digits only',
        duration: 2000,
        position: 'top',
        color: 'danger'
      });
      toast.present();
      return;
    }

     const loader = await this.loadingController.create({
      message: 'Scheduling',
      cssClass: 'custom-loader-class'
      
    });

    await loader.present(); 
    
    try 
    {
      // Check if the ID already exists in the Firestore collection
      const idExistsSnapshot = await this.db.collection('Interviewees').ref.where('int_id', '==', this.int_id).get();
  
      if (!idExistsSnapshot.empty) {
        const toast = await this.toastController.create({
          message: 'ID already exists',
          duration: 2000,
          position: 'top',
          color: 'danger'
        });
        toast.present();
        return;
      }
  
      // Proceed with user creation and data addition
    //   const userCredential = await this.auth.createUserWithEmailAndPassword(this.email, this.int_id);
  
    //   if (userCredential) {
    //     await this.db.collection('Interviewees').add({
    //       int_id: this.int_id,
    //       name: this.name,
    //       surname: this.surname,
    //       email: this.email,
    //       date: this.date,
    //       Status: this.status
    //     });
  
    //     console.log('User and data added successfully');
    //   }
    } catch (error) {
      // Handle errors
      console.error('Error:', error);
      // Display appropriate error messages using toastController
    }
    this.auth.createUserWithEmailAndPassword(this.email, this.int_id)
      .then( userCredential => {

      
        this.db
        .collection('Interviewees')
        .add({
                int_id:this.int_id,
                name:this.name,
                surname:this.surname,
                email: this.email,
                date:this.date,
                Status:this.status
        })
        .then((docRef) => {
          loader.dismiss();

        })
        .catch((error) => {
         // loader.dismiss();
          console.error('Error adding document: ', error);
          alert('failed : ' + error);
        });
    
       

        /////
        // this.router.navigateByUrl("/login");
       
        // ...
      })
      .catch(async( error:any) => {
        //loader.dismiss();
        const errorCode = error.code;
        const errorMessage = error.message;
       


        if(errorMessage=='Firebase: The email address is badly formatted. (auth/invalid-email).'){
        const toast = await this.toastController.create({
          message: "The email address is badly formatted",
          duration: 2000,
          position: 'top',
          color:'danger'
        });
        toast.present();
        return;
      }else if(errorMessage=="Firebase: The email address is already in use by another account. (auth/email-already-in-use)."){
        const toast = await this.toastController.create({
          message: "The email address is already in use by another account",
          duration: 2000,
          position: 'top',
          color:'danger'
        });
        toast.present();
        return;
    }
      });

    }

    // const loader = await this.loadingController.create({
    //   message: 'Signing up',
    //   cssClass: 'custom-loader-class'
    // });
 
    // await loader.present();
    // this.auth.createUserWithEmailAndPassword(this.email, this.int_id)
    // .then(async (userCredential) => {
    //   if (userCredential.user) {
    //     await this.db.collection('Interviewees').add({
    //       int_id:this.int_id,
    //       name:this.name,
    //       surname:this.surname,
    //       email: this.email,
    //       date: new Date()
    //     });
    //     loader.dismiss();
    //     alert("Registered Successfully");
    //     this.navCtrl.navigateForward("/sign-in");
    //   } else {
    //     loader.dismiss();
    //     alert('User not found');
    //   }
    // })
    // .catch((error) => {
    //   loader.dismiss();
    //   const errorMessage = error.message;
    //   alert(errorMessage);
    // });
  }
      
function presentToast(message: any, string: any) {
  throw new Error('Function not implemented.');
}

  

function isValidInput(input: any, any: any) {
  throw new Error('Function not implemented.');
}
  // You can implement the checkScheduledInterviews() method here
 



