import { Component } from '@angular/core';
import { ToastController, NavController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-schedule-interview',
  templateUrl: './schedule-interview.page.html',
  styleUrls: ['./schedule-interview.page.scss'],
})
export class ScheduleInterviewPage {

  // Initialize properties with default values
  int_id: string = '';
  name: string = '';
  surname: string = '';
  email: string = '';
  date: string = '';

  constructor(
    private db: AngularFirestore,
    private toastController: ToastController,
    public navCtrl: NavController,
    private auth: AngularFireAuth
  ) {}

  async submit() {
    // Rest of the code remains unchanged
  }

  // You can implement the checkScheduledInterviews() method here
  checkScheduledInterviews() {
    // Your logic for checking scheduled interviews
  }
}
