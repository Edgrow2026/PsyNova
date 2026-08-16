import { PsychiatristsService } from './psychiatrists/psychiatrists.service';
import { BookingsService } from './bookings/bookings.service';
import { ReviewsService } from './reviews/reviews.service';
import { ComplaintsService } from './complaints/complaints.service';
import { AuthService } from './auth/auth.service';
import { SettingsService } from './settings/settings.service';
import { SmsWayService } from './sms/smsway.service';
import { PayHereService } from './payments/payhere.service';

const psychiatristsService = new PsychiatristsService();
const bookingsService = new BookingsService(psychiatristsService);
const reviewsService = new ReviewsService(psychiatristsService);
const complaintsService = new ComplaintsService(bookingsService);
const authService = new AuthService();
const settingsService = new SettingsService();
const smsWayService = new SmsWayService();
const payHereService = new PayHereService();

export async function getNestServices() {
  return {
    psychiatristsService,
    bookingsService,
    reviewsService,
    complaintsService,
    authService,
    settingsService,
    smsWayService,
    payHereService,
  };
}
