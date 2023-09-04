import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { where } from 'firebase/firestore';

@Component({
  selector: 'app-scheduled-interviews',
  templateUrl: './scheduled-interviews.page.html',
  styleUrls: ['./scheduled-interviews.page.scss'],
})
export class ScheduledInterviewsPage implements OnInit {
  groupedInterviewees: Map<string, any[]> = new Map();
  todayDateString: string;
  selectedOption: any;// Variable to store the selected option

  constructor(private firestore: AngularFirestore) {
    this.todayDateString = new Date().toDateString();
  }

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.firestore.collection('Interviewees').valueChanges().subscribe((data: any[]) => {
      this.groupedInterviewees = data.reduce((result, interviewee) => {
        const itemDate = new Date(interviewee.date);
        const dateKey = itemDate.toDateString();
        
        if (dateKey === this.todayDateString) {
          //interviewee.date = 'Today';
        } else {
          interviewee.date = dateKey;
        }

        if (!result.has(dateKey)) {
          result.set(dateKey, []);
        }
        result.get(dateKey).push(interviewee);
        
        return result;
      }, new Map<string, any[]>());
    });
  }

  toggleSelect(item: any) {
    item.showSelect = !item.showSelect;
  }
  
  onSelectOption(item: any) {
    item.showSelect = false; // Hide the select after an option is selected
  }

  async updateField(int_id:any,selectedOption:any) {
   // const newValue = this.selectedOption;

    try {
      // Find the document with the matching int_id
      const querySnapshot = await this.firestore.collection('Interviewees', ref => ref.where('int_id', '==', int_id)).get().toPromise();
   console.log(querySnapshot);
      // If a matching document is found, update its fields
      if (!querySnapshot?.empty) {
        const documentId = querySnapshot?.docs[0].id;
 
        await this.firestore.collection('Interviewees').doc(documentId).update({
       
          Status: selectedOption,
          // Update other fields as needed
        });
  
        console.log('Document updated successfully');
      } else {
        console.log('No matching document found');
      }
    } catch (error) {
      console.error('Error updating document:', error);
      // Display appropriate error message using toastController
    }
  } 
  
  

// updateStatus(item: any) {
//   // Update the Firestore document with the selected status
//   this.firestore.collection('Interviewees').doc(item.int_id).update({
//     Status: item.selectedOption
//   });
}


