import { ModalMs365AccountsComponent } from './modal-ms365-accounts.component';

describe('ModalMs365AccountsComponent', () => {
  it('closes with changed false when nothing happened', () => {
    const ref = { close: jasmine.createSpy('close') };
    const c = new ModalMs365AccountsComponent(ref as any);
    c.close();
    expect(ref.close).toHaveBeenCalledWith({ changed: false, cascade: false });
  });

  it('remembers a change and a cascade across several events', () => {
    const ref = { close: jasmine.createSpy('close') };
    const c = new ModalMs365AccountsComponent(ref as any);
    c.onChanged({ cascade: true });
    c.onChanged({ cascade: false });
    c.close();
    expect(ref.close).toHaveBeenCalledWith({ changed: true, cascade: true });
  });
});
