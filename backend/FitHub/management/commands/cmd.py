from django.core.management.base import BaseCommand
from django.utils.timezone import now
from datetime import timedelta, date
from FitHub.models import CustomUser, DailyCalorieSummary

class Command(BaseCommand):
    help = 'Fill or update DailyCalorieSummary for all users in a date range'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=30,
            help='Number of days back from today to fill daily summaries',
        )
        parser.add_argument(
            '--start_date',
            type=str,
            help='Start date in YYYY-MM-DD format (overrides --days if provided)',
        )
        parser.add_argument(
            '--end_date',
            type=str,
            help='End date in YYYY-MM-DD format (defaults to today if --start_date provided)',
        )

    def handle(self, *args, **options):
        days = options['days']
        start_date_str = options.get('start_date')
        end_date_str = options.get('end_date')

        today = now().date()

        if start_date_str:
            start_date = date.fromisoformat(start_date_str)
            end_date = date.fromisoformat(end_date_str) if end_date_str else today
        else:
            start_date = today - timedelta(days=days)
            end_date = today

        self.stdout.write(f"Filling daily summaries from {start_date} to {end_date} for all users...")

        users = CustomUser.objects.all()
        for user in users:
            current_date = start_date
            while current_date <= end_date:
                summary, created = DailyCalorieSummary.objects.get_or_create(user=user, date=current_date)
                summary.calculate_net_calories()
                self.stdout.write(f"Processed {user.email} for {current_date}")
                current_date += timedelta(days=1)

        self.stdout.write(self.style.SUCCESS("Done filling daily calorie summaries!"))
