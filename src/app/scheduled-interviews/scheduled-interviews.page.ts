import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { LoadingController,NavController, ToastController , AlertController} from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ViewAcademicRecordModalPage } from '../view-academic-record-modal/view-academic-record-modal.page';
import { CvModalPage } from '../cv-modal/cv-modal.page';
import 'firebase/firestore';

import { getFirestore, writeBatch, doc, updateDoc, Timestamp } from 'firebase/firestore';

// ...

import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-scheduled-interviews',
  templateUrl: './scheduled-interviews.page.html',
  styleUrls: ['./scheduled-interviews.page.scss'],
})
export class ScheduledInterviewsPage implements OnInit {
  
  selectedProvince: any;
  selectedMaspala: any;



  userDocument: any;
  userData: any;
  recipient = '';
  faculty = '';
  crs = '';
  level = '';
  course: any[] = [];
  subCourses: any;
  references: any[] = [];
  coursedata: any[] = [];
  showSecondDropdownFlag: boolean = false;
  selectedOption: any;
  wilData: any[] = [];
  recommended: any = 0;
  naturalSciencesData: any[] = [];
  selectAllCheckbox: any;
  tableData: any[] = [];
  academicRecordURl: any;
  document = '';
  gradeAverage = '';
  employment = '';
  selectedItems: any[] = [];
  showEmailFields = false;
  recipientEmail: any;
  subject: any;
  body: any;
  urlArrays: any[] = [];
  currentPage: number = 1;
  rowsPerPage: number = 10;
  cities: any[] = [];
  city: any[] = [];
  province = '';
  genderbase = '';
  companyNames: any[] = [];
  recommendDate:any;

  filteredStudentProfiles: any[] = [];

  municipalities: string[] = [];
  filteredMunicipalities: string[] = [];
  selectedMunicipality: string = '';
  filteredData: any[] = [];

  searchMunicipalities(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    if (searchTerm.trim() === '') {
      this.filteredMunicipalities = [];
    } else {
      this.filteredMunicipalities = this.municipalities.filter((municipality) =>
        municipality.toLowerCase().startsWith(searchTerm)
      );
    }
  }

  selectMunicipality(municipality: string) {
    this.selectedMunicipality = municipality;
    this.filteredMunicipalities = [];
    this.filter();
  }

  isFormValid(): boolean {
    if (this.showEmailFields) {
      const isRecipientValid = typeof this.recipient === 'string' && this.recipient.trim().length > 0;
      const isRecipientEmail = isRecipientValid && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.recipient);
  
      return (
        this.companyNames &&
        isRecipientEmail &&
        this.subject &&
        this.body
      );
    }
  
    return false;
  }
  
  isFieldEmpty(field: string | string[]): boolean {
    if (Array.isArray(field)) {
      return field.some((item: string) => !item || item.trim().length === 0);
    }
    return !field || field.trim().length === 0;
  }
  
  

  getSelectionCount(): number {
    return this.tableData.filter((data: { checked: any }) => data.checked)
      .length;
  }

  constructor(
    private http: HttpClient,
    private alertController: AlertController,
    private toastController: ToastController,
    private modalController: ModalController,
    private firestore: AngularFirestore,
    private db: AngularFirestore,
    private loadingController: LoadingController,
    navCtrl: NavController,
    private auth: AngularFireAuth,
    private navController: NavController,
    
  ) {
    this.getWilData();

  }

  previousPage() {
    this.currentPage--;
  }

  nextPage() {
    this.currentPage++;
  }

  totalPages(): number {
    return Math.ceil(this.tableData.length / this.rowsPerPage);
  }


  ngOnInit() {}


  async getCourse(event: any) {
    this.db
      .collection(event.detail.value, (ref) => ref.where('course', '>', ''))
      .valueChanges()
      .subscribe((data) => {
        this.course = data;
        console.log(this.faculty + '  :dd');
      });
  }


 
  getWilData() {
    this.db
      .collection('applicant-application', (ref) =>
        ref.where('status', '==', 'active')
      )
      .snapshotChanges()
      .subscribe((data) => {
        this.userData = data.map((d) => {
          const id = d.payload.doc.id;
          const docData = d.payload.doc.data() as any; // Cast docData as any type
          return { id, ...docData };
        });
        console.log(this.userData);
        this.tableData = this.userData;
      });
  }

  //open cv
  async openCVModal(cvUrl: any) {
    const modal = await this.modalController.create({
      component: CvModalPage,
      componentProps: {
        cvUrl: cvUrl,
      },
    });

    await modal.present();
  }

  filter() {
    let query = this.firestore.collection('applicant=application', (ref) => {
      let filteredQuery = ref.where('status', '==', 'active');
  
  
      if (this.genderbase !== '') {
        filteredQuery = filteredQuery.where('gender', '==', this.genderbase);
      }
  
      if (this.gradeAverage !== '') {
        const minGrade = Number(this.gradeAverage);
        const maxGrade = minGrade + 10;
        filteredQuery = filteredQuery.where('gradeAverage', '>=', minGrade).where('gradeAverage', '<', maxGrade);
      }

      return filteredQuery;
    });
  
    query.valueChanges().subscribe((data) => {
      console.log(data);
      this.tableData = data; // Assign retrieved data to tableData
    });
  }
  
  
  applyFilter() {
    this.filter();
  }

  applySecondFilter() {
    this.filter();
  }

  avg() {
    this.filter();
  }

  genderFilter() {
     this.filter();
  }


  async openViewAcademicRecordModal(pdfUrl: any) {
    const modal = await this.modalController.create({
      component: ViewAcademicRecordModalPage,
      componentProps: {
        pdfUrl: pdfUrl,
      },
    });

    await modal.present();
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

  async goToAddUser(): Promise<void> {
    try {
      await this.getUser();

      if (
        this.userDocument &&
        this.userDocument.role &&
        this.userDocument.role.addUser === 'on'
      ) {
        // Navigate to the desired page
        this.navController.navigateForward('/add-user');
      } else {
        const toast = await this.toastController.create({
          message: 'Unauthorized user.',
          duration: 2000,
          position: 'top',
        });
        toast.present();
      }
    } catch (error) {
      console.error('Error navigating to Add user Page:', error);
    }
  }

  async goToHistory(): Promise<void> {
    try {
      await this.getUser();

      if (
        this.userDocument &&
        this.userDocument.role &&
        this.userDocument.role.history === 'on'
      ) {
        // Navigate to the desired page
        this.navController.navigateForward('/history');
      } else {
        const toast = await this.toastController.create({
          message: 'Unauthorized user.',
          duration: 2000,
          position: 'top',
        });
        toast.present();
      }
    } catch (error) {
      console.error('Error navigating to History Page:', error);
    }
  }

  
  async goToGraded(): Promise<void> {

    try {
      await this.getUser();
  
      if (this.userDocument && this.userDocument.role && this.userDocument.role.wil === 'on') {
        // Navigate to the desired page
        this.navController.navigateForward('/marks');
      } else {
        const toast = await this.toastController.create({
          message: 'Unauthorized user.',
          duration: 2000,
          position: 'top'
        });
        toast.present();
      }
    } catch (error) {
      console.error('Error navigating to Graded interviews Page:', error);
    }
  }
  async  goToStaff(): Promise<void> {
    try {
      await this.getUser();
  
      if (this.userDocument && this.userDocument.role && this.userDocument.role.statistic === 'on') {
        // Navigate to the desired page
        this.navController.navigateForward('/all-users');
      } else {
        const toast = await this.toastController.create({
          message: 'Unauthorized user.',
          duration: 2000,
          position: 'top'
        });
        toast.present();
      }
    } catch (error) {
      console.error('Error navigating to All Staff members Page:', error);
    }
  }
  async goToAllApplicants(): Promise<void> {
    try {
      await this.getUser();
  
      if (this.userDocument && this.userDocument.role && this.userDocument.role.validation === 'on') {
        // Navigate to the desired page
        this.navController.navigateForward('/all-applicants');
      } else {
        const toast = await this.toastController.create({
          message: 'Unauthorized user.',
          duration: 2000,
          position: 'top'
        });
        toast.present();
      }
    } catch (error) {
      console.error('Error navigating to grade avaerage validator Page:', error);
    }
  }
  async goToScore(): Promise<void> {
    try {
      await this.getUser();
  
      if (this.userDocument && this.userDocument.role && this.userDocument.role.employment === 'on') {
        // Navigate to the desired page
        this.navController.navigateForward('/score-capture');
      } else {
        const toast = await this.toastController.create({
          message: 'Unauthorized user.',
          duration: 2000,
          position: 'top'
        });
        toast.present();
      }
    } catch (error) {
      console.error('Error navigating to score capture Page:', error);
    }
  }  

  //sign out

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
          },
        },
        {
          text: 'Confirm',
          handler: () => {
            this.auth
              .signOut()
              .then(() => {
                this.navController.navigateForward('/sign-in');
                this.presentToast();
              })
              .catch((error) => {});
          },
        },
      ],
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

  goToMenuPage(): void {
    this.navController.navigateForward('/dashboard').then(() => {
      window.location.reload();
    });
  }

  goToHomePage(): void {
    this.navController.navigateBack('/home');
  }
  goToStaffProfile(): void {
    this.navController.navigateBack('/staffprofile');
  }

  //selecting the checkboxes
  async selectAll() {
    if (this.selectAllCheckbox) {
      const updatePromises = [];
      for (const data of this.tableData) {
        if (!data.checked) {
          data.checked = true;
          const promise = this.updateSelectedItems(
            data,
            data.academicRecordURl,
            data.email
          );
          updatePromises.push(promise);
          if (!this.selectedItems.includes(data)) {
            this.selectedItems.push(data);
            this.urlArrays.push(data.academicRecordURl);
            this.userEmailArray.push(data.email);
          }
        }
      }
      await Promise.all(updatePromises);
    } else {
      for (const data of this.tableData) {
        if (data.checked) {
          data.checked = false;
          const index = this.selectedItems.indexOf(data);
          if (index > -1) {
            this.selectedItems.splice(index, 1);
            this.urlArrays.splice(index, 1);
            this.userEmailArray.splice(index, 1);
          }
        }
      }
    }
    console.log(this.userEmailArray);
    console.log(this.urlArrays);
    // Check if any checkbox is checked
    this.showEmailFields = this.selectedItems.length > 0;
  }

  userEmailArray: any[] = [];
  updateSelectedItems(item: any, url: any, email: any) {
    if (item.checked) {
      this.selectedItems.push(item);
      this.urlArrays.push(url);
      this.userEmailArray.push(email);
    } else {
      const index = this.selectedItems.indexOf(item);
      if (index > -1) {
        this.selectedItems.splice(index, 1);
        this.urlArrays.splice(index, 1);
        this.userEmailArray.splice(index, 1);
      }
    }
    console.log('singleE', this.userEmailArray);
    // Check if any checkbox is checked
    if (this.userEmailArray.length == 0) {
      this.selectAllCheckbox = false;
    }

    this.showEmailFields = this.selectedItems.length > 0;
  }

  async sendEmail() {
    const loader = await this.loadingController.create({
      message: 'Sending Email...',
      cssClass: 'custom-loader-class',
    });
    await loader.present();

    const url =
      'http://localhost/Co-op-project/co-operation/src/send_email.php';

    const recipient = encodeURIComponent(this.recipient);
    const subject = encodeURIComponent(this.subject);
    const body = encodeURIComponent(this.body);

    // Convert the array to a comma-separated string
    const urlArrayString = encodeURIComponent(this.urlArrays.join(','));

    // Include the array in the query string
    const query = `recipient=${recipient}&subject=${subject}&body=${body}&urlArrays=${urlArrayString}`;

    const headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );

    this.http.get(url + '?' + query, { headers: headers }).subscribe(
      (response) => {
        this.sendRecommandationNotification();
        loader.dismiss();
        console.log(response);

        this.handleEmailResponse(response); // Handle the email response
      },
      (error) => {
        loader.dismiss();
        // Handle any errors that occurred during the request
        console.error('Error:', error);
      }
    );
  }

  formatBody() {
    this.body = this.body.replace(/\n/g, '<br>');
  }
  

  async handleEmailResponse(response: any) {
    // Check the response and display a pop-up message accordingly
    if (response === 'Email sent successfully!!!.') {
      await this.showEmailSentAlert(response);
  
      // Change the status and company name of selected students to "recommended"
      const db = getFirestore();
      const batch = writeBatch(db);
      const studentStatusCountMap = new Map<string, number>(); // Map to track status change count for each student
  
      this.selectedItems.forEach((item) => {
        const docRef = doc(db, 'studentProfile', item.id);
        const newStatus = 'recommended';
        const previousCompanyNames = item.companyNames || []; // Get previous company names from the item
  
        // Check if the current status is not already "recommended"
        if (item.status !== newStatus) {
          const updatedCompanyNames = [
            ...previousCompanyNames,
            this.companyNames,
          ]; // Add the new company name to the array
          const recommendDate = Timestamp.now(); // Current timestamp
  
          batch.update(docRef, {
            status: newStatus,
            companyNames: updatedCompanyNames,
            recommendDate: recommendDate,
          });
  
          // Increment the count for the current student
          const count =
            item.status === 'recommended'
              ? item.count || 0
              : (item.count || 0) + 1;
          studentStatusCountMap.set(item.id, count);
        }
      });
  
      await batch.commit();
      console.log('done');
  
      // Log the status change count for each student
      studentStatusCountMap.forEach(async (count, studentId) => {
        console.log(
          `Student with ID ${studentId} has been recommended ${count} time(s).`
        );
  
        // Update the count in the student's document
        const docRef = doc(db, 'studentProfile', studentId);
        await updateDoc(docRef, { count });
      });
    } else {
      await this.showEmailErrorAlert();
    }
  }
  
  

  async showEmailSentAlert(response: any) {
    const alert = await this.alertController.create({
      header: 'Email Sent',
      message: response,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            // Clear the recipient email field
            this.recipient = '';

            // Uncheck all checkboxes
            this.tableData.forEach((data) => {
              data.checked = false;
            });
            this.showEmailFields = false;
          },
        },
      ],
    });

    await alert.present();
  }

  async showEmailErrorAlert() {
    const alert = await this.alertController.create({
      header: 'Email Error',
      message: 'Email not sent. Please try again.',
      buttons: [
        {
          text: 'OK',
          handler: () => {
            // Clear the recipient email field
            this.recipient = '';

            // Uncheck all checkboxes
            this.tableData.forEach((data) => {
              data.checked = false;
            });
            this.showEmailFields = false;
          },
        },
      ],
    });

    await alert.present();
  }

  sendRecommandationNotification() {
    const url =
      'http://localhost/Co-op-project/co-operation/src/send_recommendation_notification.php';

    const recipient = encodeURIComponent(this.recipient);
    const subject = encodeURIComponent(this.subject);
    const body = encodeURIComponent(this.body);
    // Convert the array to a comma-separated string
    const emailsArray = encodeURIComponent(this.userEmailArray.join(','));

    // Include the array in the query string
    const query = `recipient=${recipient}&subject=${subject}&body=${body}&emailsArray=${emailsArray}`;

    const headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );

    this.http.get(url + '?' + query, { headers: headers }).subscribe(
      () => {
        console.log(' (notification)'); // Log the response to

        // Handle the response from the PHP file
      },
      (error) => {
        // Handle any errors that occurred during the request
        console.error('Error:', error + ' (notification)');
      }
    );
  }
}
