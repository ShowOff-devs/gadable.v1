<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Actions\SuperAdmin\Organizations\RecordOrganizationEvent;
use App\Http\Controllers\Controller;
use App\Http\Requests\SuperAdmin\StoreOrganizationDocumentRequest;
use App\Models\Organization;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class OrganizationDocumentController extends Controller
{
    public function store(StoreOrganizationDocumentRequest $request, Organization $organization, RecordOrganizationEvent $events): RedirectResponse
    {
        Gate::authorize('update', $organization);
        $file = $request->file('document');
        DB::transaction(function () use ($request, $organization, $events, $file): void {
            $path = $file->store("organization-documents/{$organization->id}/quarantine", 'local');
            $organization->documents()->create(['uploaded_by' => $request->user()->id, 'document_type' => $request->validated('document_type'), 'display_name' => $file->getClientOriginalName(), 'storage_disk' => 'local', 'storage_path' => $path, 'mime_type' => $file->getMimeType(), 'size' => $file->getSize(), 'scan_status' => 'quarantined']);
            $events->handle($organization, $request->user(), 'organization.document_quarantined', null, ['document_type' => $request->validated('document_type'), 'scan_status' => 'quarantined']);
        });
        return back()->with('success', 'Document uploaded to quarantine. It is unavailable until malware scanning is configured.');
    }
}
