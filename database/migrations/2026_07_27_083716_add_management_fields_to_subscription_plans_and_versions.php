<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('subscription_plans', function (Blueprint $table) {
            $table->string('intended_customer_type')->nullable();
            $table->string('deployment_scope')->nullable();
        });

        Schema::table('subscription_plan_versions', function (Blueprint $table) {
            $table->decimal('renewal_amount', 18, 2)->nullable();
            $table->decimal('vat_rate', 5, 2)->nullable();
            $table->unsignedInteger('grace_period_days')->default(0);
            $table->date('price_valid_until')->nullable();
            $table->date('effective_until')->nullable();
            $table->text('commercial_notes')->nullable();
            $table->json('limits')->nullable();
            $table->json('support_configuration')->nullable();
            $table->text('change_summary')->nullable();
            $table->json('validation_results')->nullable();
            $table->timestamp('validated_at')->nullable();
            $table->string('validator_version')->nullable();
            $table->string('snapshot_checksum', 64)->nullable();
            $table->unsignedInteger('lock_version')->default(1);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('subscription_plan_versions', function (Blueprint $table) {
            $table->dropColumn([
                'renewal_amount',
                'vat_rate',
                'grace_period_days',
                'price_valid_until',
                'effective_until',
                'commercial_notes',
                'limits',
                'support_configuration',
                'change_summary',
                'validation_results',
                'validated_at',
                'validator_version',
                'snapshot_checksum',
                'lock_version',
            ]);
        });

        Schema::table('subscription_plans', function (Blueprint $table) {
            $table->dropColumn(['intended_customer_type', 'deployment_scope']);
        });
    }
};
