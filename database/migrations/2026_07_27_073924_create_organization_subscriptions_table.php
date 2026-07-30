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
        Schema::create('organization_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->restrictOnDelete();
            $table->foreignId('subscription_plan_version_id')->constrained()->restrictOnDelete();
            $table->string('reference')->unique();
            $table->string('status')->default('draft');
            $table->date('starts_on')->nullable();
            $table->date('ends_on')->nullable();
            $table->date('renewal_on')->nullable();
            $table->date('grace_ends_on')->nullable();
            $table->string('currency', 3)->default('PHP');
            $table->decimal('agreed_implementation_amount', 18, 2)->nullable();
            $table->decimal('agreed_recurring_amount', 18, 2)->nullable();
            $table->boolean('vat_inclusive')->nullable();
            $table->json('entitlement_overrides')->nullable();
            $table->string('contract_status')->nullable();
            $table->string('contract_reference')->nullable();
            $table->string('purchase_order_reference')->nullable();
            $table->string('invoice_reference')->nullable();
            $table->string('payment_confirmation_reference')->nullable();
            $table->unsignedInteger('lock_version')->default(1);
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['status', 'ends_on']);
            $table->index(['organization_id', 'status']);
            $table->index(['subscription_plan_version_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('organization_subscriptions');
    }
};
