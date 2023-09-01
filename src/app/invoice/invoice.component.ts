import { Component } from '@angular/core';
import { AllService } from '../all.service';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css'],
})
export class InvoiceComponent {
  clientsList: any[] = [];
  invoiceDate: any;
  invoiceItems: any[] = [];
  tdsItems: any[] = [];
  selectedItems: any[] = [];
  subtotal: number = 0;
  taxtotal: number = 0;
  balanceDue: number = 0;
  tdsRate: number = 0;
  inde = 0;
  netTerm: any[] = [
    ['Net 7', 7],
    ['Net 10', 10],
    ['Net 15', 15],
    ['Net 30', 30],
    ['Net 45', 45],
    ['Net 60', 60],
    ['Net 90 ', 90],
  ];

  invoiceFromDate: any;
  invoiceToDate: any;
  invoiceDueDate: any;
  constructor(private allService: AllService) {
    let obj = {
      id: '',
      desc: '',
      qty: 1,
      rate: 0,
      amount: 0,
      gst: 0,
    };
    this.selectedItems.push(obj);

    this.getClientList();
    this.getInvoiceItems();
    this.getTDS();
    this.invoiceDate = new Date().toISOString().substring(0, 10);
    console.log(this.invoiceDate);
    this.invoiceFromDate = this.addDays(-61);
    this.invoiceToDate = this.addDays(-31);
    console.log(this.invoiceFromDate);
  }

  getTDS() {
    this.allService.getTDSItems().subscribe({
      next: (data: any) => {
        this.tdsItems = data.results;
      },
    });
  }

  addDays(days: number) {
    let d = new Date();
    let newDate: any = d.setDate(d.getDate() + days);

    newDate = new Date(newDate).toISOString().substring(0, 10);

    return newDate;
  }

  netChange(value: any) {
    let days = +value;
    console.log(this.addDays(days));
    this.invoiceDueDate = this.addDays(days);
  }

  getClientList() {
    this.allService.getClients().subscribe({
      next: (data: any) => {
        this.clientsList = data.results;
        console.log(this.clientsList);
      },
    });
  }

  getInvoiceItems() {
    this.allService.getItems().subscribe({
      next: (data: any) => {
        this.invoiceItems = data.results;
      },
    });
  }

  addAnotherItem(tdsVal: any) {
    let id: String = '';
    let desc: String = '';
    let obj = {
      id: id,
      desc: desc,
      qty: 1,
      rate: 0,
      amount: 0,
      gst: 0,
    };

    this.selectedItems.push(obj);
    console.log(this.selectedItems);
    this.inde++;
    this.calculateAll();
    this.tdsChange(tdsVal);
  }

  selectChange(item: any, index: number, tdsVal: any, id: any) {
    console.log(id);
    if (id == '' || id === undefined) {
      return alert('Please select client ID first');
    }

    let id1: String = '';
    let desc: String = '';
    let obj = {
      id: id1,
      desc: desc,
      qty: 1,
      rate: 0,
      amount: 0,
      gst: 0,
    };
    this.subtotal = 0;
    this.taxtotal = 0;
    this.balanceDue = 0;
    this.tdsRate = 0;
    let gst: number = 0;
    this.selectedItems[index] = obj;

    this.selectedItems[index]['id'] = item;
    let itemData: any = this.invoiceItems.filter((data) => data._id === item);
    console.log('price' + itemData[0].sellingPrice);

    let clientData1: any = this.clientsList.filter((data) => data._id === id);
    let clientData = clientData1[0];
    if (clientData.billingAddress.Country === 'India') {
      if (clientData.billingAddress.City === 'MH') {
        gst = +itemData[0]?.intraStateTax || 0;
      } else {
        gst = +itemData[0]?.interStateTax || 0;
      }
    } else {
      gst = 0;
    }
    this.selectedItems[index].amount = itemData[0].sellingPrice;
    this.selectedItems[index].rate = itemData[0].sellingPrice;

    console.log(itemData);
    console.log(this.selectedItems[index]['desc']);
    this.selectedItems[index]['desc'] = itemData[0]?.description;
    console.log(this.selectedItems);
    this.calculateAll();
    this.tdsChange(tdsVal);
    let obj1 = this.calculateGst(itemData, 1, gst);
    this.selectedItems[index].gst = obj1.itemGst;
  }

  qtyChange(
    form: any,
    itemId: any,
    qty: any,
    index: number,
    clientI: number,
    tdsvalue: any,
    id: any
  ) {
    if (id == '' || id === undefined) {
      return alert('Please select client ID first!!!');
    } else if (itemId === undefined || itemId == '') {
      return alert('Please select Item first!!!');
    }
    console.log(itemId + 'item id');
    this.selectedItems[index].qty = qty;

    console.log(form.value);
    let clientIdd = form.value.clientID;
    let gst: number = 0;
    console.log(itemId);
    let itemData: any = this.invoiceItems.filter((data) => data._id === itemId);
    console.log('item data');
    console.log(itemData);
    let clientData1: any = this.clientsList.filter(
      (data) => data._id === clientI
    );
    let clientData = clientData1[0];
    if (clientData.billingAddress.Country === 'India') {
      if (clientData.billingAddress.City === 'MH') {
        gst = +itemData[0]?.intraStateTax || 0;
      } else {
        gst = +itemData[0]?.interStateTax || 0;
      }
    } else {
      gst = 0;
    }

    let obj = this.calculateGst(itemData, qty, gst);
    this.subtotal = 0;
    this.taxtotal = 0;
    this.balanceDue = 0;
    this.tdsRate = 0;

    this.selectedItems[index].amount = obj.itemTotal;
    this.selectedItems[index].gst = obj.itemGst;
    this.selectedItems[index].rate = itemData[0].sellingPrice;
    console.log(this.selectedItems);
    this.calculateAll();
    this.tdsChange(tdsvalue);
  }

  calculateGst(item: any, qty: number, gst: number) {
    console.log(item[0].sellingPrice);
    console.log('item');
    let itemTotal: number = 0;
    itemTotal = +item[0].sellingPrice * +qty;
    let itemGst: number = 0;
    let t = +itemTotal + +gst;
    if (gst !== 0) {
      itemGst = t / 100;
    } else {
      itemGst = 0;
    }

    let obj = {
      itemTotal,
      itemGst: itemGst,
    };
    return obj;
  }
  grandTotal: number = 0;
  calculateAll() {
    this.selectedItems.forEach((item) => {
      this.subtotal = this.subtotal + item.amount;
      this.taxtotal = this.taxtotal + item.gst;
    });
    this.grandTotal = this.subtotal + this.taxtotal;
  }
  tdsChange(value?: any) {
    this.tdsRate = (+this.grandTotal * +value) / 100;
    this.balanceDue = this.grandTotal - this.tdsRate;
  }
  attachmentUrl: any;
  fileAdded(event: any) {
    let formData = new FormData();
    formData.append('file', event.target.files[0]);

    this.allService.attachDocument(formData).subscribe({
      next: (data: any) => {
        console.log('file added');
        console.log(data);
        this.attachmentUrl = data.url;
      },
    });
  }

  submitData(formData: any) {
    let itemsArray: any[] = [];
    this.selectedItems.forEach((data) => {
      let obj = {
        id: data.id,
        qty: data.qty,
        rate: data.rate,
        amount: data.amount,
        gst: data.gst,
      };
      itemsArray.push(obj);
    });

    let obj = {
      clientId: formData.clientID,
      invoiceDate: this.invoiceDate,
      netTerm: formData.net,
      dueDate: this.invoiceDueDate,
      billingPeriod: {
        from: this.invoiceFromDate,
        to: this.invoiceToDate,
      },
      items: itemsArray,
      subTotal: this.subtotal,
      taxTotal: this.taxtotal,
      grandTotal: this.grandTotal,
      tds: this.tdsRate,
      balance: this.balanceDue,
      attachmentUrl: this.attachmentUrl,
    };

    this.allService.submitInvoice(obj).subscribe({
      next: (data: any) => {
        console.log(data);
        alert(data.message);
      },
    });
  }
}
