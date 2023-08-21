import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, IonicModule } from '@ionic/angular';
import { NavController } from '@ionic/angular';


import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ToastController } from '@ionic/angular';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  navController: NavController;
  userDocument:any

  constructor(private alertController: AlertController,private toastController: ToastController,private navCtrl: NavController,  private auth:AngularFireAuth,private db: AngularFirestore) {
    this.getUser();
    this.navController = navCtrl;
   }

  ngOnInit() {
  }

 

  goToView(): void {
    this.navController.navigateBack('/staffprofile');
  }
  ionViewDidEnter() {
    this.getUser();
  }
  

  

  async getUser(): Promise<void> {
    const user = await this.auth.currentUser;

    if (user) {
      try {
        const querySnapshot = await this.db
          .collection('registeredStaff')
          .ref.where('email', '==', user.email)
          .get();

        if (!querySnapshot.empty) {
          this.userDocument = querySnapshot.docs[0].data();
          console.log(this.userDocument);
        }
      } catch (error) {
        console.error('Error getting user document:', error);
      }
    }
  }

  async navigateBasedOnRole(page: string): Promise<void> {
    try {
      await this.getUser();

      let authorized = false;
      let message = '';

      if (this.userDocument && this.userDocument.role) {
        switch (page) {
          case 'all-applicants':
            authorized = this.userDocument.role.allApplicants === 'on';
            message = 'Unauthorized user for Wil page.';
            break;
          case 'schedule-interview':
            authorized = this.userDocument.role.marks === 'on';
            message = 'Unauthorized user for Employment page.';
            break;
          case 'add-user':
            authorized = this.userDocument.role.addUser === 'on';
            message = 'Access denied to History page.';
            break;
          case 'score-capture':
            authorized = this.userDocument.role.score === 'on';
            message = 'Unauthorized user for Reports page.';
            break;
            case 'interview-history':
            authorized = this.userDocument.role.history === 'on';
            message = 'Unauthorized user for wil page.';
            break;
            case 'scheduledInterviews':
              authorized = this.userDocument.role.upcomingInterviews === 'on';
              message = 'Unauthorized user for grade validator page.';
              break;
          default:
            authorized = false;
            message = 'Invalid page.';
            break;
        }
      }

      if (authorized) {
        this.navController.navigateForward('/' + page);
      } else {
        const toast = await this.toastController.create({
          message: 'Unauthorized Access:You do not have the necessary permissions to access this page. Please contact the administrator for assistance.',
          duration: 2000,
          position: 'top'
        });
        toast.present();
      }
    } catch (error) {
      console.error('Error navigating based on role:', error);
    }
  }

  goToScheduleInterview(): Promise<void> {
    return this.navigateBasedOnRole('schedule-interview');
  }

  goToAllApplicants(): Promise<void> {
    return this.navigateBasedOnRole('all-applicants');
  }

  goToScheduledInterviews(): Promise<void> {
    return this.navigateBasedOnRole('scheduled-interviews');
  }

  goToScores(): Promise<void> {
    return this.navigateBasedOnRole('score-capture');
  }

  goToAddUser(): Promise<void> {
    return this.navigateBasedOnRole('add-user');
  }
  goToInterviewHistory(): Promise<void> {
    return this.navigateBasedOnRole('interview-history');
  }
  goToGraded(): Promise<void> {
    return this.navigateBasedOnRole('marks');
  }
  goToAllUsers(): Promise<void> {
    return this.navigateBasedOnRole('all-users');
  }

  goToStaffProfile() {
    this.navController.navigateForward('/staffprofile');
  }


  signOut() {
    this.navController.navigateForward('/home');
  }

  goToHomePage(): void {
    this.navController.navigateBack('/home');
  }

 



  async presentConfirmationAlert() {
    const alert = await this.alertController.create({
      header: 'Confirmation',
      message: 'Are you sure you want to SIGN OUT?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
         cssClass: 'my-custom-alert',
          handler: () => {
            console.log('Confirmation canceled');
          }
        }, {
          text: 'Confirm',
          handler: () => {
           
            
            this.auth.signOut().then(() => {
              this. navCtrl.navigateForward("/applicant-login");
              this.presentToast();
        
        
            }).catch((error) => {
            
            });



          }
        }
      ]
    });
    await alert.present();
  }


  async presentToast() {
    const toast = await this.toastController.create({
      message: 'SIGNED OUT!',
      duration: 1500,
      position: 'top',
    
    });

    await toast.present();
  }



  }
















