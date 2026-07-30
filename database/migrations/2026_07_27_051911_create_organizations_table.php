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
        Schema::create('organizations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('organizations')->restrictOnDelete();
            $table->string('official_name');
            $table->string('code')->unique();
            $table->string('acronym')->nullable();
            $table->text('description')->nullable();
            $table->string('website')->nullable();
            $table->string('email')->nullable();
            $table->string('phone', 40)->nullable();
            $table->date('established_on')->nullable();
            $table->string('organization_type')->nullable();
            $table->string('geographic_scope')->nullable();
            $table->string('region_name')->nullable();
            $table->string('province_name')->nullable();
            $table->string('locality_name')->nullable();
            $table->string('address_line')->nullable();
            $table->string('official_contact_name')->nullable();
            $table->string('official_contact_position')->nullable();
            $table->string('official_contact_email')->nullable();
            $table->string('data_classification')->default('standard');
            $table->string('onboarding_status')->default('draft');
            $table->string('account_status')->default('pending_activation');
            $table->boolean('identity_verified')->default(false);
            $table->boolean('authority_verified')->default(false);
            $table->boolean('primary_admin_ready')->default(false);
            $table->boolean('subscription_ready')->default(false);
            $table->boolean('security_ready')->default(false);
            $table->boolean('has_critical_issue')->default(false);
            $table->unsignedInteger('lock_version')->default(1);
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('activated_at')->nullable();
            $table->timestamp('suspended_at')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->timestamp('terminated_at')->nullable();
            $table->timestamps();
            $table->index(['account_status', 'official_name']);
            $table->index(['onboarding_status', 'official_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('organizations');
    }
};
